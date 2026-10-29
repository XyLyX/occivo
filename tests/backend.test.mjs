import test from "node:test";
import assert from "node:assert/strict";
import submit from "../netlify/functions/submit-request.mjs";
import admin from "../netlify/functions/admin-requests.mjs";
test("request collection fails closed without privileged secret",async()=>{
 delete process.env.SUPABASE_SECRET_KEY;
 const request=new Request("https://occivo.example/api/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
 const response=await submit(request);
 assert.equal(response.status,503);
});
test("invalid customer request is rejected before database I/O",async()=>{
 process.env.SUPABASE_SECRET_KEY="placeholder-only-unit-test";
 const request=new Request("https://occivo.example/api/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer_name:"",permission:false})});
 const response=await submit(request);
 assert.equal(response.status,400);
 delete process.env.SUPABASE_SECRET_KEY;
});
test("unauthenticated admin requests are rejected",async()=>{
 process.env.SUPABASE_SECRET_KEY="placeholder-only-unit-test";
 const response=await admin(new Request("https://occivo.example/api/admin-requests",{method:"GET"}));
 assert.equal(response.status,403);
 delete process.env.SUPABASE_SECRET_KEY;
});
