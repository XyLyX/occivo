"use strict";
// Publishable Supabase key is safe in a browser; secret database keys are NOT.
const SB_URL="https://vtpaxzptyyggapnlkoma.supabase.co";
const SB_KEY="sb_publishable_8RVKrrjBGnF5q6bbHRSi9w_K575VkTZ";
const el=id=>document.getElementById(id);
const panels=["login-panel","mfa-panel","dashboard"];
let jwt="",factorId="",selectedId="",enrolling=false;
function show(id){for(const p of panels)el(p).classList.toggle("hidden",p!==id);}
function tell(id,message){el(id).textContent=message}
async function auth(path,{method="GET",body,token=jwt}={}){
 const r=await fetch(SB_URL+"/auth/v1/"+path,{method,headers:{"apikey":SB_KEY,"Content-Type":"application/json",...(token?{"Authorization":"Bearer "+token}:{})},body:body?JSON.stringify(body):undefined,cache:"no-store"});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(data.msg||data.message||data.error_description||data.error||("Supabase rejected this request (HTTP "+r.status+")."));
 return data;
}
async function api(path,method="GET",body){
 const r=await fetch("/api/admin-requests"+path,{method,headers:{"Authorization":"Bearer "+jwt,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined,cache:"no-store"});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(data.error||"Request failed");
 return data;
}
function claims(){try{return JSON.parse(atob(jwt.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")))}catch{return {}}}
async function enterMfa(){
 const user=await auth("user");
 if(!user.email_confirmed_at)throw Error("Administrator email verification is required.");
 if(claims().aal==="aal2"){show("dashboard");el("logout").classList.remove("hidden");await list();await loadWatchtower();return;}
 // Match Supabase's mfa.listFactors(): MFA factors arrive in GET /user.
 // GET /auth/v1/factors is unsupported and returns HTTP 405.
 const factors=Array.isArray(user.factors)?user.factors:[];
 const factor=factors.find(x=>x.factor_type==="totp"&&x.status==="verified");
 enrolling=!factor;
 if(factor){factorId=factor.id;el("mfa-explain").textContent="Enter the current code from your authenticator app.";el("mfa-qr").classList.add("hidden");el("mfa-secret").textContent="";}
 else{
   const created=await auth("factors",{method:"POST",body:{factor_type:"totp",friendly_name:"OCCIVO admin"}});
   factorId=created.id;
   if(!factorId||!created.totp?.qr_code)throw Error("MFA enrollment was unavailable");
   let svg=created.totp.qr_code;
   el("mfa-qr").src=svg.startsWith("data:image")?svg:"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
   el("mfa-qr").classList.remove("hidden");
   el("mfa-explain").textContent="Scan this private QR in an authenticator app, then enter its six-digit code. Do not share the QR or recovery information.";
   el("mfa-secret").textContent="Keep the QR and secret private. You will be prompted for a fresh code at every sign-in.";
 }
 show("mfa-panel");el("mfa-code").focus();
}
function signout(){
 const old=jwt;jwt="";factorId="";selectedId="";el("password").value="";el("mfa-code").value="";
 el("logout").classList.add("hidden");show("login-panel");tell("login-message","Signed out.");
 if(old)auth("logout",{method:"POST",token:old}).catch(()=>{});
}
el("login-form").addEventListener("submit",async e=>{
 e.preventDefault();tell("login-message","Checking credentials…");
 let passwordAccepted=false;
 try{
  const email=el("email").value.trim().toLowerCase();
  if(!email)throw Error("Administrator email is required.");
  const session=await auth("token?grant_type=password",{method:"POST",token:"",body:{email,password:el("password").value}});
  jwt=session.access_token||"";if(!jwt)throw Error("No session token received");
  passwordAccepted=true;
  el("password").value="";tell("login-message","");await enterMfa();
 }catch(err){
  tell("login-message",passwordAccepted?"Password accepted. Authenticator setup failed: "+err.message:"Sign-in failed: "+err.message);
 }
});
el("mfa-form").addEventListener("submit",async e=>{
 e.preventDefault();tell("mfa-message","Verifying…");
 try{
  const challenge=await auth("factors/"+encodeURIComponent(factorId)+"/challenge",{method:"POST",body:{}});
  const verified=await auth("factors/"+encodeURIComponent(factorId)+"/verify",{method:"POST",body:{challenge_id:challenge.id,code:el("mfa-code").value.trim()}});
  if(verified.access_token)jwt=verified.access_token;
  if(claims().aal!=="aal2")throw Error("Second factor was not established");
  el("mfa-code").value="";el("mfa-qr").src="";el("mfa-qr").classList.add("hidden");
  tell("mfa-message","");show("dashboard");el("logout").classList.remove("hidden");await list();await loadWatchtower();
 }catch(err){tell("mfa-message",err.message)}
});
el("mfa-cancel").addEventListener("click",signout);el("logout").addEventListener("click",signout);
function node(tag,value,className){const n=document.createElement(tag);if(value!==undefined)n.textContent=String(value);if(className)n.className=className;return n;}
function infoCell(label,value){const d=node("div");const term=node("dt",label),v=node("dd",value??"—");d.append(term,v);return d}
async function list(){
 try{
  tell("dashboard-message","Loading requests…");
  const filter=el("filter").value;
  const d=await api(filter?"?status="+encodeURIComponent(filter):"");
  const rows=d.requests||[];
  el("request-list").replaceChildren();
  let total=rows.length,needs=rows.filter(r=>r.status==="new").length,active=rows.filter(r=>!["fulfilled","cancelled","closed"].includes(r.status)).length;
  el("metrics").replaceChildren();
  for(const [label,val] of [["Shown requests",total],["New in this list",needs],["Open in this list",active]]){const c=node("div",undefined,"metric");c.append(node("strong",val),node("span",label));el("metrics").append(c)}
  for(const r of rows){
   const b=node("button",undefined,"request-card");b.type="button";
   const left=node("span");left.append(node("strong",(r.request_ref||"Request")+" · "+(r.customer_name||"")),node("small",(r.gifting_brief?.occasion||"Gift")+" · "+(r.gifting_brief?.budget||"Budget not specified")+" · "+new Date(r.created_at).toLocaleDateString()));
   b.append(left,node("span",r.status||"new","status-pill"));b.addEventListener("click",()=>details(r.id));el("request-list").append(b);
  }
  tell("dashboard-message",total+" request(s) displayed.");
 }catch(err){tell("dashboard-message",err.message);if(/sign-in|admin/i.test(err.message))signout()}
}
async function details(id){
 try{
  const data=await api("?id="+encodeURIComponent(id));selectedId=id;const r=data.request;
  const grid=node("dl",undefined,"detail-meta");
  const b=r.gifting_brief||{},c=r.selected_concept||{};
  for(const [label,value] of [["Reference",r.request_ref],["Customer",r.customer_name],["Email",r.customer_email],["Phone",r.customer_phone],["Occasion",b.occasion],["Recipient",b.recipient],["Recipient name",b.recipient_name],["Recipient detail",b.recipient_other],["Child age",b.child_age],["Budget",b.budget],["Timing",b.timing],["Delivery",b.destination],["Dubai area",b.dubai_area],["About them",b.about_them],["Gift directions",(b.directions||[]).join(", ")],["Avoid",b.avoid],["Presentation",b.presentation],["Card message",b.card_message],["Other notes",b.other_notes],["Preferences",b.preferences],["Chosen direction",c.style],["Gift idea",c.title],["Description",c.description],["Customer note",r.customer_message]])grid.append(infoCell(label,value));
  const response=node("a","Open email draft (select your verified sender)");response.href="mailto:"+encodeURIComponent(r.customer_email)+"?subject="+encodeURIComponent("OCCIVO gifting request "+r.request_ref);response.className="btn btn-secondary";const wrap=node("div");wrap.append(grid,response);el("detail-body").replaceChildren(wrap);
  el("update-status").value=r.status;el("internal-notes").value=r.internal_notes||"";
  const history=el("history-list");history.replaceChildren();
  for(const h of data.events||[]){history.append(node("div",new Date(h.created_at).toLocaleString()+" · "+h.event_type+" · "+(h.event_notes||""),"history-item"))}
  await loadContacts(id);
  el("request-detail").classList.remove("hidden");el("request-detail").scrollIntoView({behavior:"auto",block:"start"});el("update-status").focus();
 }catch(err){tell("dashboard-message",err.message)}
}
el("update-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!selectedId)return;
 tell("dashboard-message","Saving…");
 try{await api("","PATCH",{id:selectedId,status:el("update-status").value,notes:el("internal-notes").value});await details(selectedId);await list();await loadWatchtower();tell("dashboard-message","Request updated. Watchtower flags will reconcile on the next scan.");}
 catch(err){tell("dashboard-message",err.message)}
});
el("close-detail").addEventListener("click",()=>{el("request-detail").classList.add("hidden");selectedId="";el("refresh").focus()});
el("filter").addEventListener("change",list);el("refresh").addEventListener("click",async()=>{await list();await loadWatchtower()});


// Watchtower is a read-only operator queue; only a verified AAL2 session can access its API.
async function watchApi(method="GET"){
 const r=await fetch("/api/admin-watchtower",{method,headers:{"Authorization":"Bearer "+jwt,"Content-Type":"application/json"},cache:"no-store"});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(d.error||("Watchtower HTTP "+r.status));
 return d;
}
function watchedDate(value){
 if(!value)return "Not yet";
 try{return new Date(value).toLocaleString("en-AE",{timeZone:"Asia/Dubai",dateStyle:"medium",timeStyle:"short"})+" Dubai";}
 catch{return "Not yet";}
}
async function loadWatchtower(){
 const queue=el("watchtower-list");
 const health=el("watchtower-health");
 health.textContent="Loading Watchtower…";
 try{
  const data=await watchApi();
  queue.replaceChildren();
  const counts=el("watchtower-counts");
  counts.replaceChildren();
  for(const [label,n] of [["Urgent",data.counts?.urgent||0],["High",data.counts?.high||0],["Normal",data.counts?.normal||0]]){
   const tile=node("div",undefined,"watch-count");
   tile.append(node("strong",n),node("span",label));counts.append(tile);
  }
  const scan=data.latest_scan;
  if(!scan){
   health.textContent="No successful scan recorded yet. Choose Scan now. Empty alerts do not mean no problems.";
  }else{
   const age=(Date.now()-new Date(scan.started_at).getTime())/60000;
   const overdue=age>75;
   health.textContent="Last scan: "+watchedDate(scan.started_at)+" · "+scan.state+
     " · "+scan.scanned_count+" active case(s) checked"+
     (overdue?" · Scheduled scan appears late":"")+
     (data.truncated?" · Alert display limited to 200":"");
  }
  if(!data.alerts?.length){
   queue.append(node("p",scan?.state==="success"?"No active alerts in the latest successful scan.":"No alerts to display; scan health is not confirmed.","watch-empty"));
   return;
  }
  for(const a of data.alerts){
   const card=node("button",undefined,"watch-alert watch-"+a.severity);
   card.type="button";
   const heading=node("div",undefined,"watch-alert-line");
   heading.append(node("strong",a.title),node("span",a.severity.toUpperCase(),"watch-priority"));
   card.append(heading,node("span",a.detail,"watch-description"));
   card.setAttribute("aria-label",a.severity+" priority: "+a.title+". Open request details");
   card.addEventListener("click",()=>details(a.request_id));
   queue.append(card);
  }
 }catch(err){
  queue.replaceChildren();
  health.textContent="Watchtower unavailable: "+err.message+". The manual request list remains available.";
 }
}
el("watchtower-scan").addEventListener("click",async()=>{
 const button=el("watchtower-scan");
 button.disabled=true;button.textContent="Scanning…";
 tell("watchtower-health","Checking active cases securely…");
 try{await watchApi("POST");await loadWatchtower();}
 catch(err){tell("watchtower-health","Scan failed: "+err.message+". No customer records were changed.");}
 finally{button.disabled=false;button.textContent="Scan now";}
});
\n
// Manual, operator-attested external contact ledger. Never sends or verifies delivery.
let pendingContactEventId="";
async function contactApi(path,method="GET",body){
 const r=await fetch("/api/admin-contacts"+path,{
  method,headers:{"Authorization":"Bearer "+jwt,"Content-Type":"application/json"},
  body:body?JSON.stringify(body):undefined,cache:"no-store"
 });
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(data.error||"Contact history is unavailable");
 return data;
}
async function loadContacts(id){
 const target=el("contact-history");
 target.replaceChildren();
 el("contact-message").textContent="";
 try{
  const {records}=await contactApi("?id="+encodeURIComponent(id));
  if(!records.length){
   target.append(node("p","No outbound contacts recorded. This does not prove no email was sent.","small"));
   return;
  }
  for(const r of records){
   const line=node("div",undefined,"contact-entry");
   line.append(
    node("strong",r.channel+" · "+r.purpose),
    node("span",watchedDate(r.logged_at)+" · Operator attestation, delivery not verified"),
    node("p",r.operator_note||"No note")
   );
   target.append(line);
  }
 }catch(err){
  target.append(node("p","Unable to load contact history: "+err.message,"small"));
 }
}
el("contact-form").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!selectedId)return;
 const form=el("contact-form");
 if(!form.reportValidity())return;
 const button=el("contact-save");
 button.disabled=true;
 tell("contact-message","Recording operator-attested contact…");
 if(!pendingContactEventId)pendingContactEventId=crypto.randomUUID();
 try{
  await contactApi("","POST",{
   event_id:pendingContactEventId,case_id:selectedId,
   channel:el("contact-channel").value,
   purpose:el("contact-purpose").value,
   note:el("contact-note").value,
   attested:el("contact-attested").checked
  });
  pendingContactEventId="";
  form.reset();
  await loadContacts(selectedId);
  tell("contact-message","Contact recorded. This is not proof of inbox delivery. Choose Scan now to reconcile Watchtower.");
 }catch(err){
  tell("contact-message","Unable to record contact: "+err.message);
 }finally{button.disabled=false;}
});
el("contact-form").addEventListener("change",()=>{
 // Operator changing the event means it must have a distinct idempotency ID.
 pendingContactEventId="";
});
