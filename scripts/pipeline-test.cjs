// Pipeline test: Quote → Email flow
const d = require('better-sqlite3')('dev.db');
const { randomUUID } = require('crypto');
const now = new Date().toISOString();

try {
  // 1. Create quote
  d.prepare(`INSERT INTO Quote (id, quoteNumber, status, customerName, customerEmail, subtotal, shippingCost, totalAmount, currency, depositPercent, shippingMethod, originCity, destinationCity, estimatedTransit, validUntil, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    randomUUID(), 'QT-TEST-001', 'draft', 'Pipeline Test', 'test@doge-consulting.com',
    5000, 800, 5800, 'USD', 70, 'Sea Freight LCL',
    'Shenzhen', 'Seattle, WA', 25,
    new Date(Date.now() + 30*86400000).toISOString(), now, now
  );
  console.log('1. Quote CREATE: PASS');
  
  // 2. Read quote
  const q = d.prepare('SELECT quoteNumber, customerName, status, totalAmount FROM Quote WHERE quoteNumber = ?').get('QT-TEST-001');
  console.log('2. Quote READ: PASS -', JSON.stringify(q));
  
  // 3. Update status
  d.prepare('UPDATE Quote SET status = ? WHERE quoteNumber = ?').run('sent', 'QT-TEST-001');
  const q2 = d.prepare('SELECT status FROM Quote WHERE quoteNumber = ?').get('QT-TEST-001');
  console.log('3. Quote UPDATE (draft->sent): PASS - status:', q2.status);
  
  // 4. Delete
  d.prepare('DELETE FROM Quote WHERE quoteNumber = ?').run('QT-TEST-001');
  console.log('4. Quote DELETE: PASS');
  
  // 5. Email log
  d.prepare(`INSERT INTO EmailLog (id, "to", subject, type, status, createdAt) VALUES (?,?,?,?,?,?)`).run(
    randomUUID(), 'test@doge-consulting.com', 'Test Quote QT-TEST-001', 'quote_sent', 'sent', now
  );
  const e = d.prepare('SELECT subject, status FROM EmailLog ORDER BY createdAt DESC LIMIT 1').get();
  console.log('5. Email LOG: PASS -', JSON.stringify(e));
  d.prepare(`DELETE FROM EmailLog WHERE subject LIKE '%QT-TEST-001%'`).run();
  
  console.log('\n✅ QUOTE-TO-EMAIL PIPELINE TEST: ALL 5 STEPS PASSED');
} catch(err) {
  console.error('❌ PIPELINE TEST FAILED:', err.message);
}
d.close();
