const dbPath = process.env.DATABASE_PATH || require('path').join(__dirname, '..', 'data', 'production.db');
const d = require('better-sqlite3')(dbPath);
const { randomUUID } = require('crypto');
const now = new Date().toISOString();
const token = 'test-pay-' + Date.now();

// Create a test quote
const quoteId = randomUUID();
d.prepare(`INSERT INTO Quote (id, quoteNumber, status, customerName, customerEmail, subtotal, shippingCost, totalAmount, currency, depositPercent, shippingMethod, originCity, destinationCity, estimatedTransit, validUntil, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
  quoteId, 'QT-TEST-PAY', 'sent', 'Jacky Zou', 'dogetech77@gmail.com',
  100, 50, 150, 'USD', 70, 'LCL', 'Shenzhen', 'Seattle', 25,
  new Date(Date.now() + 30*86400000).toISOString(), now, now
);

// Create a test order (Payment requires orderId)
const orderId = randomUUID();
d.prepare(`INSERT INTO [Order] (id, orderNumber, status, customerName, customerEmail, subtotal, shippingCost, totalAmount, depositAmount, balanceDue, currency, quoteId, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
  orderId, 'ORD-TEST-PAY', 'pending', 'Jacky Zou', 'dogetech77@gmail.com',
  100, 50, 150, 0, 105, 'USD', quoteId, now, now
);

// Create payment record
const paymentId = randomUUID();
d.prepare(`INSERT INTO Payment (id, paymentNumber, amount, currency, status, type, method, orderId, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
  paymentId, 'PAY-TEST-001', 105, 'USD', 'pending', 'deposit', 'credit_card', orderId, now, now
);

// Create payment link
d.prepare(`INSERT INTO PaymentLink (id, token, amount, currency, description, status, quoteId, paymentId, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
  randomUUID(), token, 105, 'USD', 'Deposit for QT-TEST-PAY (70%)', 'active', quoteId, paymentId, now, now
);

console.log('✅ Test payment link created!');
console.log(`   Quote: QT-TEST-PAY ($150)`);
console.log(`   Order: ORD-TEST-PAY`);
console.log(`   Payment: $105 (70% deposit)`);
console.log(`   Token: ${token}`);
console.log(`\n   👉 Open: http://localhost:3002/pay/${token}`);
d.close();
