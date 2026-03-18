// E2E test: CEO posts chat → standup processes → agents reply → verify
const d = require('better-sqlite3')('dev.db');
const { randomUUID } = require('crypto');
const { execSync } = require('child_process');
const now = new Date().toISOString();

console.log('═══ E2E Chat → Ticket → Reply Test ═══\n');

// Step 1: Post a test chat message from CEO
const chatId = randomUUID();
d.prepare(`INSERT INTO AgentLog (id,agent,type,priority,title,content,status,assignedTo,tags,relatedTo,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
  chatId, 'jacky', 'chat', 'normal',
  '@seth @tiffany — Test: verify the quote page has tool links working correctly',
  '@seth @tiffany — Please verify that the CBM Calculator and 3D Visualizer links on the /quote page are working correctly after the recent deployment. Report back.',
  'open', 'seth,tiffany', '@seth,@tiffany', 'chat:ceo', now, now
);
console.log('1. ✅ CEO chat posted: "@seth @tiffany — Test: verify quote page tool links"');

// Verify it's open
const open = d.prepare(`SELECT COUNT(*) AS c FROM AgentLog WHERE type='chat' AND status='open'`).get();
console.log(`   Open chats in DB: ${open.c}`);

d.close();

// Step 2: Run the standup (which should process the chat)
console.log('\n2. Running standup...');
try {
  const output = execSync('node agents/run-fleet.mjs --mode evening 2>&1', { encoding: 'utf-8', timeout: 30000 });
  const chatLines = output.split('\n').filter(l => l.includes('chat') || l.includes('Chat') || l.includes('ticket') || l.includes('REPLY') || l.includes('💬'));
  console.log('   Standup output (chat-related lines):');
  chatLines.slice(0, 10).forEach(l => console.log(`   ${l.trim()}`));
} catch (e) {
  console.log(`   Standup error: ${e.message.substring(0, 200)}`);
}

// Step 3: Verify the results
const d2 = require('better-sqlite3')('dev.db', { readonly: true });

// Check ticket was created
const ticket = d2.prepare(`SELECT id,title,status FROM AgentLog WHERE type='decision' AND title LIKE '%quote page%' ORDER BY createdAt DESC LIMIT 1`).get();
console.log(`\n3. Decision ticket: ${ticket ? '✅ ' + ticket.title + ' (' + ticket.status + ')' : '❌ NOT FOUND'}`);

// Check agent replies in chat
const replies = d2.prepare(`SELECT agent,title,content FROM AgentLog WHERE type='chat' AND relatedTo=? ORDER BY createdAt ASC`).all(`chat:${chatId}`);
console.log(`\n4. Agent replies in chat thread: ${replies.length}`);
replies.forEach(r => {
  const names = {seth:'Seth Parker',tiffany:'Tiffany Wang',alex:'Alex Chen'};
  console.log(`   💬 ${names[r.agent] || r.agent}: ${r.content.substring(0, 120)}`);
});

// Check original chat is now completed
const original = d2.prepare(`SELECT status FROM AgentLog WHERE id=?`).get(chatId);
console.log(`\n5. Original chat status: ${original?.status === 'completed' ? '✅ completed' : '❌ ' + original?.status}`);

// Clean up test data
d2.close();
const d3 = require('better-sqlite3')('dev.db');
d3.prepare(`DELETE FROM AgentLog WHERE relatedTo=?`).run(`chat:${chatId}`);
d3.prepare(`DELETE FROM AgentLog WHERE id=?`).run(chatId);
d3.prepare(`DELETE FROM AgentLog WHERE title LIKE '%quote page%' AND type='decision'`).run();
d3.close();
console.log('\n6. ✅ Test data cleaned up');

console.log('\n═══ TEST COMPLETE ═══');
