import {db,trim,json,ready} from "../../lib/server.mjs";
const recipients=new Set(["Partner / spouse","Parent","Sibling","Friend","Colleague / client","Child","Other"]);
const budgets=new Set(["Under AED 250","AED 250–500","AED 500–1,000","AED 1,000–2,500","AED 2,500–5,000","AED 5,000+ / bespoke","Prefer not to say"]);
const times=new Set(["Today / tomorrow","Within 3 days","This week","Within 2 weeks","Flexible / no fixed date"]);
const places=new Set(["Dubai","Elsewhere in UAE","Outside UAE","I'll collect / deliver myself"]);
const occasions=new Set(["Birthday","Wedding","Housewarming","Anniversary","New baby","Thank you","Corporate / client gifting","Just because","Other"]);
const presentations=new Set(["","Beautiful standard presentation","Premium / signature presentation","Include a handwritten card"]);
const directions=new Set(["Daily use","Experience","Keepsake","Home","Child","Gourmet","Books and design","Tech","Open"]);
export default async function handler(request){
 if(request.method!=="POST")return json(405,{error:"Method not allowed"});
 if(!ready())return json(503,{error:"Concierge is currently unavailable. Email concierge@occivo.com."});
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return json(403,{error:"Origin not allowed"});
 if(!request.headers.get("content-type")?.includes("application/json"))return json(415,{error:"JSON required"});
 try{
  const raw=await request.text();
  if(raw.length>8000)return json(413,{error:"Request too large"});
  const input=JSON.parse(raw);
  if(trim(input.honeypot,100))return json(202,{accepted:false,error:"Submission not accepted"});
  const email=trim(input.customer_email,200).toLowerCase();
  const phone=trim(input.customer_phone,45);
  const b=input.brief||{};
  const brief={
   recipient:trim(b.recipient,70),recipient_name:trim(b.recipient_name,60),
   recipient_other:trim(b.recipient_other,80),child_age:trim(b.child_age,3),
   occasion:trim(b.occasion,80),occasion_other:trim(b.occasion_other,80),
   timing:trim(b.timing,50),budget:trim(b.budget,50),
   destination:trim(b.destination,50),dubai_area:trim(b.dubai_area,80),
   about_them:trim(b.about_them,200),
   directions:Array.isArray(b.directions)?[...new Set(b.directions.filter(x=>directions.has(x)))].slice(0,9):[],
   avoid:trim(b.avoid,300),presentation:trim(b.presentation,100),
   card_message:trim(b.card_message,280),other_notes:trim(b.other_notes,500)
  };
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!recipients.has(brief.recipient)||!occasions.has(brief.occasion)||!times.has(brief.timing)||!budgets.has(brief.budget)||!places.has(brief.destination)||!presentations.has(brief.presentation)||input.permission!==true)return json(400,{error:"Please complete the required fields and consent."});
  if(brief.recipient==="Other"&&!brief.recipient_other)return json(400,{error:"Please describe the recipient."});
  if(brief.recipient==="Child"&&(!/^\d{1,2}$/.test(brief.child_age)||Number(brief.child_age)>17))return json(400,{error:"Please provide the child's age (0–17)."});
  if(brief.occasion==="Other"&&!brief.occasion_other)return json(400,{error:"Please describe the occasion."});
  const ref="OC-"+crypto.randomUUID().replace(/-/g,"").slice(0,14).toUpperCase();
  const concept={style:"Concierge review",title:"Three personalised gifting directions requested",description:"Pending OCCIVO team sourcing and feasibility review",why:"",presentation:brief.presentation||"OCCIVO to advise"};
  const rows=await db("gift_requests",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify({request_ref:ref,customer_name:null,customer_email:email,customer_phone:phone||null,gifting_brief:brief,selected_concept:concept,customer_message:brief.other_notes||null,consent_at:new Date().toISOString(),source:"website",status:"new"})});
  const record=rows?.[0];
  if(!record?.id)throw Error("No record returned");
  try{await db("gift_request_events",{method:"POST",body:JSON.stringify({gift_request_id:record.id,event_type:"submitted",event_notes:"Concierge intake received; three directions pending."})})}catch(_e){}
  return json(201,{accepted:true,reference:ref});
 }catch(_e){return json(500,{error:"Request could not be confirmed. Please contact concierge@occivo.com."});}
}
export const config={path:"/api/requests",method:"POST",rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:5}};