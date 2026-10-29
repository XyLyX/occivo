import {json,db,trim,validateAdmin,ready} from "../../lib/server.mjs";
const statuses=new Set(["new","reviewing","sourcing","awaiting_customer","approved","fulfilled","cancelled","closed"]);
const idPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export default async function handler(request){
 if(!["GET","PATCH"].includes(request.method))return json(405,{error:"Method not allowed"});
 if(!ready())return json(503,{error:"Server configuration incomplete"});
 try{
   if(!await validateAdmin(request))return json(403,{error:"Admin sign-in with verified MFA required"});
   if(request.method==="GET"){
     const url=new URL(request.url);
     const id=url.searchParams.get("id");
     if(id){
       if(!idPattern.test(id))return json(400,{error:"Invalid ID"});
       const records=await db("gift_requests?id=eq."+encodeURIComponent(id)+"&select=*&limit=1");
       if(!records?.length)return json(404,{error:"Request not found"});
       const events=await db("gift_request_events?gift_request_id=eq."+encodeURIComponent(id)+"&select=event_type,event_notes,created_at&order=created_at.desc&limit=100");
       return json(200,{request:records[0],events});
     }
     const status=url.searchParams.get("status")||"";
     if(status&&!statuses.has(status))return json(400,{error:"Invalid status"});
     const query="gift_requests?select=id,request_ref,customer_name,customer_email,status,created_at,gifting_brief,selected_concept&order=created_at.desc&limit=100"+(status?"&status=eq."+status:"");
     const records=await db(query);
     return json(200,{requests:records});
   }
   const origin=request.headers.get("origin");
   if(origin&&origin!==new URL(request.url).origin)return json(403,{error:"Origin not allowed"});
   const raw=await request.text();if(raw.length>3000)return json(413,{error:"Request too large"});
   const input=JSON.parse(raw);
   if(!idPattern.test(input.id)||!statuses.has(input.status))return json(400,{error:"Invalid update"});
   const notes=trim(input.notes,1000);
   const rows=await db("gift_requests?id=eq."+encodeURIComponent(input.id),{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({status:input.status,internal_notes:notes||null,updated_at:new Date().toISOString()})});
   if(!rows?.length)return json(404,{error:"Request not found"});
   await db("gift_request_events",{method:"POST",body:JSON.stringify({gift_request_id:input.id,event_type:"status_updated",event_notes:"Status set to "+input.status+(notes?" · "+notes:"")})});
   return json(200,{request:rows[0]});
 }catch(_error){return json(500,{error:"Unable to complete the operation"});}
}
export const config={path:"/api/admin-requests",rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:90}};
