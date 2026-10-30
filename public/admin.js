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
 if(!r.ok)throw Error(data.msg||data.message||data.error_description||"Authentication failed");
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
 if(claims().aal==="aal2"){show("dashboard");el("logout").classList.remove("hidden");await list();return;}
 const factors=await auth("factors");
 const available=[...(factors.totp||[]),...(factors.all||[]).filter(x=>x.factor_type==="totp")];
 const factor=available.find(x=>x.status==="verified");
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
 try{
  const email=el("email").value.trim().toLowerCase();
  if(!email)throw Error("Administrator email is required.");
  const session=await auth("token?grant_type=password",{method:"POST",token:"",body:{email,password:el("password").value}});
  jwt=session.access_token||"";if(!jwt)throw Error("No session token received");
  el("password").value="";tell("login-message","");await enterMfa();
 }catch(err){tell("login-message",err.message);}
});
el("mfa-form").addEventListener("submit",async e=>{
 e.preventDefault();tell("mfa-message","Verifying…");
 try{
  const challenge=await auth("factors/"+encodeURIComponent(factorId)+"/challenge",{method:"POST",body:{}});
  const verified=await auth("factors/"+encodeURIComponent(factorId)+"/verify",{method:"POST",body:{challenge_id:challenge.id,code:el("mfa-code").value.trim()}});
  if(verified.access_token)jwt=verified.access_token;
  if(claims().aal!=="aal2")throw Error("Second factor was not established");
  el("mfa-code").value="";el("mfa-qr").src="";el("mfa-qr").classList.add("hidden");
  tell("mfa-message","");show("dashboard");el("logout").classList.remove("hidden");await list();
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
  const response=node("a","Reply from concierge@occivo.com");response.href="mailto:"+encodeURIComponent(r.customer_email)+"?subject="+encodeURIComponent("OCCIVO gifting request "+r.request_ref);response.className="btn btn-secondary";const wrap=node("div");wrap.append(grid,response);el("detail-body").replaceChildren(wrap);
  el("update-status").value=r.status;el("internal-notes").value=r.internal_notes||"";
  const history=el("history-list");history.replaceChildren();
  for(const h of data.events||[]){history.append(node("div",new Date(h.created_at).toLocaleString()+" · "+h.event_type+" · "+(h.event_notes||""),"history-item"))}
  el("request-detail").classList.remove("hidden");el("request-detail").scrollIntoView({behavior:"auto",block:"start"});el("update-status").focus();
 }catch(err){tell("dashboard-message",err.message)}
}
el("update-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!selectedId)return;
 tell("dashboard-message","Saving…");
 try{await api("","PATCH",{id:selectedId,status:el("update-status").value,notes:el("internal-notes").value});await details(selectedId);await list();tell("dashboard-message","Request updated.");}
 catch(err){tell("dashboard-message",err.message)}
});
el("close-detail").addEventListener("click",()=>{el("request-detail").classList.add("hidden");selectedId="";el("refresh").focus()});
el("filter").addEventListener("change",list);el("refresh").addEventListener("click",list);
