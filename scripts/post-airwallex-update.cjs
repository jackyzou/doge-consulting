const d = require('better-sqlite3')('dev.db');
const { randomUUID } = require('crypto');
const now = new Date().toISOString();

const content = `@alex @amy @seth @rachel — URGENT: Airwallex Compliance Website Changes (CEO directive, March 18)

## Background
Airwallex flagged our website during payment account review. They saw "Cargo Insurance" and asked for an insurance license document we don't have — because we don't provide insurance directly, we coordinate it through our logistics partners.

## What Changed (DEPLOYED)
1. **"Cargo Insurance" → "Insurance Coordination"** — makes clear we facilitate, not provide
2. **"Customs Clearance" → "Customs Coordination"** — makes clear we coordinate with licensed brokers
3. Updated across all 5 languages (en, es, fr, zh-CN, zh-TW)
4. FAQ answers updated to reference "third-party logistics partners" and "licensed customs brokers"
5. Onboarding SOP updated

## Airwallex Response to Submit
CEO should paste this into the Airwallex "I cannot provide the document" text box:

> "We do not directly underwrite or provide cargo insurance, nor are we a licensed insurance broker. The Insurance Coordination listed on our website is an optional service provided exclusively through our third-party logistics and freight forwarding partners. When a client opts for this coverage, the policy is purchased per-shipment directly from our partner's insurance provider. Because of this, we do not hold a master cargo insurance policy document under our own company name."

## Airwallex Status
CEO update (3/18): Airwallex has responded and is going through final document review. Account activation imminent.

## Action Items
- @amy: Stand by for Airwallex activation — prepare to process first payment
- @seth: Website changes deployed (commit 3993846). Verify on production after next Docker rebuild.
- @rachel: Update any marketing materials that reference "Cargo Insurance" directly
- @alex: Review all service descriptions for other compliance-sensitive terms`;

d.prepare('INSERT INTO AgentLog (id,agent,type,priority,title,content,status,assignedTo,tags,relatedTo,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(
  randomUUID(), 'jacky', 'chat', 'critical', 'URGENT: Airwallex compliance — website wording changed',
  content, 'open', 'alex,amy,seth,rachel', '@alex,@amy,@seth,@rachel', 'chat:ceo', now, now
);
console.log('Posted Airwallex compliance update to fleet chat');
d.close();
