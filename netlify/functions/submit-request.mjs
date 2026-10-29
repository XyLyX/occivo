import {env,supa,pub,secret,db,trim,json,ready} from "../../lib/server.mjs";
const allowedRecipients=new Set(["Partner or spouse","Family member","Friend","Colleague or client","Someone else"]);
const allowedBudgets=new Set(["Under AED 150","AED 150–250","AED 250–500","AED 500–1000","Above AED 1000","Prefer not to say"]);
const allowedTimings=new Set(["Today or tomorrow","Within 3 days","Within a week","Later / flexible"]);
const statuses=["The Safe Choice","The Personal Choice","The Standout Choice"];
export default async function handler(request){
 if(request.method!=="POST")return json(405,{error:"Method not allowed"});
 if(!ready())return json(503,{error:"Concierge requests are temporarily unavailable. Email concierge@occivo.com."});
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return json(403,{error:"Origin not allowed"});
 if(!request.headers.get("content-type")?.includes("application/json"))return json(415,{error:"JSON required"});
 try{
  const raw=await request.text();
  if(raw.length>6500)return json(413,{error:"Request too large"});
  const input=JSON.parse(raw);
  if(trim(input.honeypot,100))return json(200,{accepted:true});
  const name=trim(input.customer_name,120),email=trim(input.customer_email,254).toLowerCase(),phone=trim(input.customer_phone,45),message=trim(input.message,1200);
  const b=input.brief||{},c=input.concept||{};
  const brief={recipient:trim(b.recipient,70),occasion:trim(b.occasion,80),budget:trim(b.budget,50),timing:trim(b.timing,40),preferences:trim(b.preferences,800)};
  const concept={style:trim(c.style,50),title:trim(c.title,90),description:trim(c.description,280),why:trim(c.why,200),presentation:trim(c.presentation,200)};
  if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!allowedRecipients.has(brief.recipient)||!allowedBudgets.has(brief.budget)||!allowedTimings.has(brief.timing)||!brief.occasion||!statuses.includes(concept.style)||!concept.title||input.permission!==true)return json(400,{error:"Please check the required fields and consent."});
  const ref="OC-"+crypto.randomUUID().replace(/-/g,"").slice(0,14).toUpperCase();
  const rows=await db("gift_requests",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify({request_ref:ref,customer_name:name,customer_email:email,customer_phone:phone||null,gifting_brief:brief,selected_concept:concept,customer_message:message||null,consent_at:new Date().toISOString(),source:"website",status:"new"})});
  const record=rows?.[0];
  if(!record?.id)throw Error("No record returned");
  // Event insertion failure must not turn a successfully saved request into a client-facing error.
  try{await db("gift_request_events",{method:"POST",body:JSON.stringify({gift_request_id:record.id,event_type:"submitted",event_notes:"Customer submitted a gifting request."})})}catch(_error){}
  return json(201,{accepted:true,reference:ref});
 }catch(_error){return json(500,{error:"We couldn't securely save your request. Please contact concierge@occivo.com."});}
}
export const config={path:"/api/requests",method:"POST",rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:5}};
