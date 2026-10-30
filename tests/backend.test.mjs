import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import submit from "../netlify/functions/submit-request.mjs";
import admin from "../netlify/functions/admin-requests.mjs";
const make=(body)=>new Request("https://occivo.example/api/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
const valid={
 customer_email:"test@example.com",customer_phone:"",
 permission:true,
 brief:{
 recipient:"Friend",occasion:"Birthday",timing:"Within 2 weeks",
 budget:"AED 250–500",destination:"Dubai",dubai_area:"Business Bay",
 recipient_name:"",about_them:"Loves books and design",
 directions:["Books and design"],avoid:"No perfume",
 presentation:"Premium / signature presentation",card_message:"",other_notes:""
 }
};
test("request collection fails closed without privileged secret",async()=>{
 delete process.env.SUPABASE_SECRET_KEY;
 const response=await submit(make(valid));
 assert.equal(response.status,503);
});
test("invalid customer request is rejected before database I/O",async()=>{
 process.env.SUPABASE_SECRET_KEY="unit-test-only";
 const response=await submit(make({...valid,customer_email:"invalid"}));
 assert.equal(response.status,400);
 delete process.env.SUPABASE_SECRET_KEY;
});
test("email-only concierge request is accepted after confirmed database insert",async()=>{
 process.env.SUPABASE_SECRET_KEY="unit-test-only";
 const previous=globalThis.fetch; const calls=[];
 globalThis.fetch=async (url,options)=>{
  calls.push({url:String(url),options});
  if(String(url).includes("gift_request_events"))return new Response("",{status:201});
  if(String(url).includes("gift_requests"))return Response.json([{id:"11111111-1111-4111-8111-111111111111"}],{status:201});
  throw new Error("Unexpected URL");
 };
 try{
  const res=await submit(make(valid));const data=await res.json();
  assert.equal(res.status,201);assert.equal(data.accepted,true);
  assert.match(data.reference,/^OC-[A-Z0-9]{14}$/);
  assert.equal(calls.length,2);
  const record=JSON.parse(calls[0].options.body);
  assert.equal(record.customer_name,null);
  assert.equal(record.customer_email,"test@example.com");
  assert.equal(record.gifting_brief.destination,"Dubai");
  assert.equal(record.gifting_brief.avoid,"No perfume");
  assert.equal(record.selected_concept.style,"Concierge review");
 }finally{globalThis.fetch=previous;delete process.env.SUPABASE_SECRET_KEY}
});
test("underage recipient requires age and no anonymous admin access",async()=>{
 process.env.SUPABASE_SECRET_KEY="unit-test-only";
 const response=await submit(make({...valid,brief:{...valid.brief,recipient:"Child",child_age:""}}));
 assert.equal(response.status,400);
 const adminRes=await admin(new Request("https://occivo.example/api/admin-requests",{method:"GET"}));
 assert.equal(adminRes.status,403);
 delete process.env.SUPABASE_SECRET_KEY;
});
test("homepage and intake have functional entry points and accessible landmarks",()=>{
 const home=readFileSync("public/index.html","utf8");
 const form=readFileSync("public/concierge.html","utf8");
 assert.match(home,/Start a gifting conversation/);
 assert.match(home,/href="\/concierge.html"/);
 assert.match(form,/id="gift-intake"/);
 assert.match(form,/id="customer-email"[^>]*required/);
 assert.match(form,/id="deeper"/);
 assert.match(form,/id="confirmation-reference"/);
 assert.doesNotMatch(form,/recipient_phone|recipient_email/i);
});
