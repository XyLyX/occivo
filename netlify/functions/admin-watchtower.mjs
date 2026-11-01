import {json,db,validateAdmin,ready} from "../../lib/server.mjs";
import {runWatchtower} from "../../lib/watchtower-service.mjs";
export default async function handler(request){
 if(!["GET","POST"].includes(request.method))return json(405,{error:"Method not allowed"});
 if(!ready())return json(503,{error:"Watchtower is not configured"});
 try{
  if(!await validateAdmin(request))return json(403,{error:"Verified administrator MFA required"});
  if(request.method==="POST"){
   const origin=request.headers.get("origin");
   if(origin&&origin!==new URL(request.url).origin)return json(403,{error:"Origin not allowed"});
   const outcome=await runWatchtower();
   return json(200,{result:outcome});
  }
  const [openAlerts,runs]=await Promise.all([
   db("watchtower_alerts?select=alert_key,request_id,code,severity,title,detail,detected_at,last_seen_at&resolved_at=is.null&order=last_seen_at.desc&limit=200"),
   db("watchtower_runs?select=id,started_at,finished_at,state,scanned_count,active_count&order=started_at.desc&limit=1")
  ]);
  const rows=openAlerts||[];
  rows.sort((a,b)=>({urgent:0,high:1,normal:2}[a.severity]??3)-({urgent:0,high:1,normal:2}[b.severity]??3)
    ||String(a.detected_at).localeCompare(String(b.detected_at)));
  const truncated=rows.length>=200;
  return json(200,{
   alerts:rows,latest_scan:runs?.[0]||null,
   shown_alerts:rows.length,truncated,
   counts:{urgent:rows.filter(x=>x.severity==="urgent").length,high:rows.filter(x=>x.severity==="high").length,normal:rows.filter(x=>x.severity==="normal").length}
  });
 }catch(_err){return json(500,{error:"Watchtower unavailable. Please use the existing request list."})}
}
export const config={path:"/api/admin-watchtower",rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:30}};
