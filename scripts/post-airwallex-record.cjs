const d = require('better-sqlite3')('dev.db');
const { randomUUID } = require('crypto');
const now = new Date().toISOString();

const content = `@alex FYI — Airwallex Compliance Response Record (March 18, 2026)

## What Airwallex Asked
They flagged "Cargo Insurance" on our website and requested an insurance license/policy document.

## Our Response (submitted to Airwallex)
We checked "I cannot provide the document" and submitted this explanation:

> "We do not directly underwrite or provide cargo insurance, nor are we a licensed insurance broker. The Cargo Insurance listed on our website is an optional service provided exclusively through our third-party logistics and freight forwarding partners. When a client opts for this coverage, the policy is purchased per-shipment directly from our partner's insurance provider. Because of this, we do not hold a master cargo insurance policy document under our own company name."

## Website Changes Made (deployed, commit de07f06)
- **Option 3 applied**: Kept "Cargo Insurance" as the header (SEO value) but added a clear disclaimer:
  *"(All insurance policies are provided and underwritten by our third-party logistics partners.)"*
- **"Customs Clearance" → "Customs Coordination"**: Proactive fix to avoid being asked for a customs broker license
- Updated across all 5 languages (en, es, fr, zh-CN, zh-TW)
- FAQ and SOP also updated

## No Supplemental Document Submitted
We explicitly stated we cannot provide the document because we are not the insurance provider. No supplemental document was attached.

## Status
Airwallex is in final document review per CEO update (3/18). Account activation expected soon.

**@alex: Please log this in our compliance records. This is the official record of our response to Airwallex's insurance document request.**`;

d.prepare('INSERT INTO AgentLog (id,agent,type,priority,title,content,status,assignedTo,tags,relatedTo,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(
  randomUUID(), 'jacky', 'chat', 'high',
  '@alex: Record Airwallex compliance response — no supplemental document submitted',
  content, 'open', 'alex', '@alex', 'chat:ceo', now, now
);
console.log('Posted Airwallex response record to fleet chat for Alex');
d.close();
