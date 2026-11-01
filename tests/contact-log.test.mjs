import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import handler from "../netlify/functions/admin-contacts.mjs";

test("contact API requires admin MFA and does not expose customer records anonymously",async()=>{
 const existing=process.env.SUPABASE_SECRET_KEY;
 process.env.SUPABASE_SECRET_KEY="unit-test-placeholder";
 try{
  const r=await handler(new Request("https://occivo.example/api/admin-contacts?id=11111111-1111-4111-8111-111111111111"));
  assert.equal(r.status,403);
 }finally{if(existing===undefined)delete process.env.SUPABASE_SECRET_KEY;else process.env.SUPABASE_SECRET_KEY=existing}
});
test("contact audit is manually attested and never initiates an external send",()=>{
 const code=readFileSync("netlify/functions/admin-contacts.mjs","utf8");
 const page=readFileSync("public/admin.html","utf8");
 const ui=readFileSync("public/admin.js","utf8");
 assert.match(code,/input\?\.attested!==true/);
 assert.match(code,/resolution=ignore-duplicates/);
 assert.match(code,/operator_recorded/);
 assert.doesNotMatch(code,/sendmail|smtp|sendgrid|twilio|whapi/i);
 assert.match(page,/id="contact-attested"/);
 assert.match(ui,/crypto\.randomUUID\(\)/);
 assert.match(ui,/Opening a draft does not count|No outbound contacts recorded/);
 assert.doesNotMatch(page,/Reply from concierge@occivo.com/);
});
