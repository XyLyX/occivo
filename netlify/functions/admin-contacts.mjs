import {json,db,trim,validateAdmin,ready} from "../../lib/server.mjs";
const guid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const channels=new Set(["email","phone","whatsapp","other"]);
const purposes=new Set(["clarification","holding","directions","followup","other"]);
export default async function handler(request){
 if(!["GET","POST"].includes(request.method))return json(405,{error:"Method not allowed"});
 if(!ready())return json(503,{error:"Server configuration incomplete"});
 try{
  if(!await validateAdmin(request))return json(403,{error:"Verified administrator MFA required"});
  const url=new URL(request.url);
  if(request.method==="GET"){
   const id=url.searchParams.get("id")||"";
   if(!guid.test(id))return json(400,{error:"Invalid case reference"});
   const records=await db("contact_events?gift_request_id=eq."+id+
     "&select=id,channel,purpose,operator_note,logged_at,attestation&order=logged_at.desc&limit=100");
   return json(200,{records:records||[],record_cap:100});
  }
  const origin=request.headers.get("origin");
  if(origin&&origin!==url.origin)return json(403,{error:"Origin not permitted"});
  const text=await request.text();
  if(text.length>2200)return json(413,{error:"Contact entry too large"});
  let input;try{input=JSON.parse(text)}catch{return json(400,{error:"Invalid contact record"})}
  if(!guid.test(input?.case_id)||!guid.test(input?.event_id)||
     !channels.has(input?.channel)||!purposes.has(input?.purpose)||
     input?.attested!==true)return json(400,{error:"A verified operator attestation is required"});
  const existing=await db("gift_requests?id=eq."+input.case_id+"&select=id&limit=1");
  if(!existing?.length)return json(404,{error:"Case not found"});
  const note=trim(input.note,500);
  // Idempotency: event UUID is generated once per operator action and held across retries.
  // A duplicate must never overwrite an earlier record or reassign it to another case.
  await db("contact_events?on_conflict=id",{
   method:"POST",headers:{"Prefer":"resolution=ignore-duplicates,return=minimal"},
   body:JSON.stringify({id:input.event_id,gift_request_id:input.case_id,
     direction:"outbound",channel:input.channel,purpose:input.purpose,
     operator_note:note||null,attestation:"operator_recorded"})
  });
  const saved=await db("contact_events?id=eq."+input.event_id+"&select=id,gift_request_id,channel,purpose,operator_note,logged_at&limit=1");
  if(saved?.[0]?.gift_request_id!==input.case_id ||
     saved[0]?.channel!==input.channel || saved[0]?.purpose!==input.purpose)
   return json(409,{error:"The record identifier is already in use"});
  return json(200,{record:saved[0],message:"Operator contact logged. No message was sent or delivered by OCCIVO."});
 }catch(_error){return json(500,{error:"Could not record customer contact"})}
}
export const config={path:"/api/admin-contacts",rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:40}};
