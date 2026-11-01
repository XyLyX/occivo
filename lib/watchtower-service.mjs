import {db,ready} from "./server.mjs";
import {evaluateCases} from "./watchtower-engine.mjs";
const iso=()=>new Date().toISOString();
const baseQuery="gift_requests?select=id,request_ref,status,created_at,updated_at,gifting_brief&status=not.in.(fulfilled,cancelled,closed)&order=created_at.asc";
async function getCases(){
 const all=[];
 for(let offset=0;offset<=5000;offset+=500){
  const rows=await db(baseQuery+"&limit=500&offset="+offset);
  if(!Array.isArray(rows))throw Error("Invalid request list");
  all.push(...rows);
  if(rows.length<500)return all;
 }
 throw Error("More than 5000 active cases: scan stopped without resolving alerts");
}
export async function runWatchtower(){
 if(!ready())throw Error("Watchtower server configuration is unavailable");
 let runId="";
 try{
  const started=await db("watchtower_runs",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify({state:"running"})});
  runId=started?.[0]?.id;
  if(!runId)throw Error("Watchtower run could not be recorded");
  const cases=await getCases();
  const timestamp=iso();
  const alerts=evaluateCases(cases,Date.parse(timestamp));
  // Bounded chunks; no AI, no email, and no customer content in logs.
  for(let i=0;i<alerts.length;i+=75){
   const batch=alerts.slice(i,i+75).map(a=>({...a,scan_id:runId,last_seen_at:timestamp,resolved_at:null}));
   await db("watchtower_alerts?on_conflict=alert_key",{
    method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},
    body:JSON.stringify(batch)
   });
  }
  // Only resolve on successful, complete scan; preserve old alerts if a scan fails.
  await db("watchtower_alerts?resolved_at=is.null&scan_id=neq."+runId,{
   method:"PATCH",headers:{"Prefer":"return=minimal"},
   body:JSON.stringify({resolved_at:timestamp})
  });
  await db("watchtower_runs?id=eq."+runId,{
   method:"PATCH",headers:{"Prefer":"return=minimal"},
   body:JSON.stringify({state:"success",finished_at:iso(),scanned_count:cases.length,active_count:alerts.length})
  });
  return {state:"success",run_id:runId,scanned:cases.length,alerts:alerts.length};
 }catch(err){
  if(runId){
   try{
    await db("watchtower_runs?id=eq."+runId,{
     method:"PATCH",headers:{"Prefer":"return=minimal"},
     body:JSON.stringify({state:"failed",finished_at:iso(),error_message:"Scan failed; no cases were changed"})
    });
   }catch(_ignored){}
  }
  throw err;
 }
}
