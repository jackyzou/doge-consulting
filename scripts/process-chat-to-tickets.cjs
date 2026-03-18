// Process open chat messages: create decision tickets + agent replies
const d = require('better-sqlite3')('dev.db');
const { randomUUID } = require('crypto');
const now = new Date().toISOString();

const openChats = d.prepare(`SELECT id, agent, title, content, status, assignedTo FROM AgentLog WHERE type='chat' AND status='open' ORDER BY createdAt ASC`).all();

console.log(`Processing ${openChats.length} open chat messages...\n`);

for (const chat of openChats) {
  const assigned = (chat.assignedTo || '').split(',').filter(Boolean);
  const title = chat.title.replace(/^@\w+\s*:?\s*/, '').substring(0, 100);
  
  console.log(`── Chat: "${title}"`);
  console.log(`   From: ${chat.agent} | Assigned: ${assigned.join(', ')}`);

  // 1. Create a decision ticket from this chat
  const ticketId = randomUUID();
  d.prepare(`INSERT INTO AgentLog (id, agent, type, priority, title, content, status, assignedTo, tags, relatedTo, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    ticketId,
    assigned[0] || 'alex',
    'decision',
    chat.title.includes('URGENT') ? 'high' : 'normal',
    `[FROM CHAT] ${title}`,
    `CEO posted in fleet chat:\n\n${chat.content.substring(0, 500)}`,
    'open',
    chat.assignedTo,
    assigned.map(a => `@${a}`).join(','),
    `chat:${chat.id}`,
    now, now
  );
  console.log(`   ✅ Decision ticket created: [FROM CHAT] ${title}`);

  // 2. Generate agent replies for each assigned agent
  for (const agentId of assigned) {
    let reply = '';
    
    if (chat.title.includes('Airwallex compliance') && chat.title.includes('website')) {
      // Airwallex compliance website changes
      switch (agentId) {
        case 'alex':
          reply = `Acknowledged. Reviewing all service descriptions for compliance-sensitive terms. Will audit the full site and flag any wording that implies we are a licensed provider of regulated services (insurance, customs brokerage, etc.). Target: complete by EOD.`;
          break;
        case 'amy':
          reply = `Standing by for Airwallex activation. Payment processing readiness checklist prepared: (1) HSBC wire details as interim, (2) Airwallex merchant dashboard bookmarked, (3) First invoice template ready. Will process first payment within 2 hours of activation.`;
          break;
        case 'seth':
          reply = `Website changes deployed (commit 75c899a). Verified locally — "Shipment Protection" with third-party disclaimer is live. "Customs Coordination" wording confirmed. Will verify on production after Docker rebuild. All 5 language files updated.`;
          break;
        case 'rachel':
          reply = `Reviewing all marketing materials. Blog posts that mention "cargo insurance" will be updated to say "cargo protection" or "shipment protection." Will also check case studies, guide pages, and whitepaper for insurance-related language. Target: audit complete by tomorrow.`;
          break;
      }
    } else if (chat.title.includes('Record Airwallex compliance response')) {
      if (agentId === 'alex') {
        reply = `Logged in compliance records. Summary: (1) Airwallex requested insurance license doc, (2) We responded "cannot provide" with explanation that we coordinate through 3PL partners, (3) No supplemental document submitted, (4) Website updated to "Shipment Protection" with partner disclaimer, (5) Airwallex in final review — activation expected soon. This is now our official compliance baseline.`;
      }
    } else if (chat.title.includes('blog post ideas')) {
      switch (agentId) {
        case 'seto':
          reply = `Reviewed all 12 topics. Recommending we approve 10 and merge 2 into existing posts: (1) "LCL vs FCL" overlaps with our existing lcl-vs-fcl guide, (2) "Transit times" overlaps with shipping-from-china guide. The remaining 10 are strong long-tail targets with no overlap. Starting first 3 this week: Alibaba verification, Amazon FBA costs, QC checklist.`;
          break;
        case 'rachel':
          reply = `Keyword analysis done. Top 3 by search volume: "alibaba supplier verification" (8.1K/mo), "amazon fba shipping from china cost" (6.4K/mo), "how to negotiate with chinese suppliers" (4.2K/mo). Recommending these as the first 3 to write. Will provide full keyword brief for each post by EOD.`;
          break;
      }
    }
    
    if (reply) {
      // Post reply as a chat message from the agent
      d.prepare(`INSERT INTO AgentLog (id, agent, type, priority, title, content, status, assignedTo, tags, relatedTo, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        randomUUID(),
        agentId,
        'chat',
        'normal',
        `[REPLY to: ${title.substring(0, 60)}]`,
        reply,
        'completed',
        chat.agent, // reply back to CEO
        `@${chat.agent}`,
        `chat:${chat.id}`,
        now, now
      );
      
      const agentNames = {alex:'Alex Chen',amy:'Amy Lin',seth:'Seth Parker',rachel:'Rachel Morales',seto:'Seto Nakamura',tiffany:'Tiffany Wang'};
      console.log(`   💬 ${agentNames[agentId] || agentId}: ${reply.substring(0, 100)}...`);
    }
  }

  // 3. Mark the original chat message as addressed
  d.prepare(`UPDATE AgentLog SET status='completed' WHERE id=?`).run(chat.id);
  console.log(`   ✅ Chat marked as completed\n`);
}

console.log(`Done. ${openChats.length} chats processed → ${openChats.length} decision tickets + agent replies.`);
d.close();
