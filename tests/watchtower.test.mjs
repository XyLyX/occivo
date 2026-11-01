import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {evaluateCases} from "../lib/watchtower-engine.mjs";
import watchApi from "../netlify/functions/admin-watchtower.mjs";
import {config} from "../netlify/functions/watchtower-scan.mjs";
const now=Date.parse("2026-11-01T10:00:00.000Z");
const earlier=h=>new Date(now-h*3600000).toISOString();
const make=(overrides={})=>({
 id:"11111111-1111-4111-8111-111111111111",
 request_ref:"OC-TEST",status:"new",
 created_at:earlier(6),updated_at:earlier(6),
 gifting_brief:{destination:"Dubai",timing:"Within 2 weeks"},...overrides
});
test("unreviewed urgent international case flags four issues, deduplicated",()=>{
 const rows=evaluateCases([make({gifting_brief:{destination:"Outside UAE",timing:"Within 3 days"}})],now);
 assert.deepEqual(rows.map(x=>x.code),["new_request","new_over_4h","country_missing","short_lead_time"]);
 assert.equal(new Set(rows.map(x=>x.alert_key)).size,rows.length);
 assert.equal(rows.filter(x=>x.severity==="urgent").length,2);
 assert(rows.every(x=>!JSON.stringify(x).includes("@")));
});
test("review, sourcing, follow-up and approved inactivity rules are distinct",()=>{
 const statuses=["reviewing","sourcing","awaiting_customer","approved"];
 const cases=statuses.map((status,i)=>make({id:"00000000-0000-4000-8000-00000000000"+i,status,updated_at:earlier(100)}));
 assert.deepEqual(evaluateCases(cases,now).map(x=>x.code),["review_stalled","sourcing_stalled","followup_review","approved_pending"]);
 assert.equal(evaluateCases(cases.map(x=>({...x,status:"closed"})),now).length,0);
});
test("fresh reviewed case produces no false overdue or sent-email claim",()=>{
 assert.deepEqual(evaluateCases([make({status:"reviewing",created_at:earlier(2),updated_at:earlier(1)})],now),[]);
});
test("watchtower is MFA protected and scheduled, no outbound customer messaging",async()=>{
 const prior=process.env.SUPABASE_SECRET_KEY;process.env.SUPABASE_SECRET_KEY="unit-test-secret";
 try{
  const res=await watchApi(new Request("https://occivo.example/api/admin-watchtower",{method:"GET"}));
  assert.equal(res.status,403);
 }finally{if(prior===undefined)delete process.env.SUPABASE_SECRET_KEY;else process.env.SUPABASE_SECRET_KEY=prior}
 assert.equal(config.schedule,"*/30 * * * *");
 const service=readFileSync("lib/watchtower-service.mjs","utf8");
 assert.doesNotMatch(service,/sendmail|smtp|whapi|twilio|whatsapp/i);
 const html=readFileSync("public/admin.html","utf8");
 const js=readFileSync("public/admin.js","utf8");
 assert.match(html,/id="watchtower-scan"/);
 assert.match(js,/watchApi\("POST"\)/);
});
