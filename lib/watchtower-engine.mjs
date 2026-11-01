// OCCIVO Watchtower v1 — deterministic, private, no email and no AI calls.
const terminal=new Set(["fulfilled","cancelled","closed"]);
const hours=(now,then)=>(now-new Date(then).getTime())/3600000;
const make=(r,code,severity,title,detail)=>({
 alert_key:r.id+":"+code,request_id:r.id,code,severity,title,detail
});
export function evaluateCases(rows,now=Date.now()){
 const alerts=[];
 for(const r of rows){
  if(terminal.has(r.status))continue;
  const b=r.gifting_brief||{};
  const age=hours(now,r.created_at);
  const unchanged=hours(now,r.updated_at||r.created_at);
  if(r.status==="new"){
   alerts.push(make(r,"new_request","high","New request needs triage","A new gifting request is waiting for operator review."));
   if(age>=4)alerts.push(make(r,"new_over_4h","urgent","Unreviewed request over four hours","Request remains new after four hours. This is an internal escalation, not a published SLA."));
  }
  if(b.destination==="Outside UAE"&&!b.destination_country &&
    ["new","reviewing","sourcing"].includes(r.status)){
   alerts.push(make(r,"country_missing","high","International destination to clarify","Destination is outside the UAE but no country is recorded. Confirm the country and exact date before any delivery quote."));
  }
  if(["Today / tomorrow","Within 3 days"].includes(b.timing) &&
    ["new","reviewing","sourcing"].includes(r.status)){
   alerts.push(make(r,"short_lead_time","urgent","Short lead-time request","The customer selected an urgent timing band. Confirm exact date and verified fulfilment options."));
  }
  if(r.status==="reviewing"&&unchanged>=24)
   alerts.push(make(r,"review_stalled","high","Review stalled over 24 hours","Case has remained in review without a recorded update for over 24 hours."));
  if(r.status==="sourcing"&&unchanged>=48)
   alerts.push(make(r,"sourcing_stalled","high","Sourcing stalled over 48 hours","Case has remained in sourcing without a recorded update for over 48 hours."));
  if(r.status==="awaiting_customer"&&unchanged>=72)
   alerts.push(make(r,"followup_review","normal","Consider a single follow-up","Customer response is pending for over 72 hours. Review the case; do not send automated reminders."));
  if(r.status==="approved"&&unchanged>=48)
   alerts.push(make(r,"approved_pending","high","Approved case needs fulfilment review","An approved case has had no recorded update for over 48 hours. Check payment, procurement and delivery evidence manually."));
 }
 return alerts;
}
export const severityOrder={urgent:0,high:1,normal:2};
