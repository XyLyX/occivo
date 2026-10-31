"use strict";
// Public Supabase project information. DO NOT put privileged/secret keys here.
const SB_URL="https://vtpaxzptyyggapnlkoma.supabase.co";
const SB_KEY="sb_publishable_8RVKrrjBGnF5q6bbHRSi9w_K575VkTZ";
const REDIRECT="https://occivo.netlify.app/reset-password.html";
const $=id=>document.getElementById(id);
const panels=["request-panel","set-panel","complete-panel","error-panel"];
let recoveryToken="";
function show(name){for(const p of panels)$(p).classList.toggle("hidden",p!==name);}
function alertError(message){$("error-message").textContent=message;show("error-panel");}
async function api(path,{method="GET",body,token}={}){
 const r=await fetch(SB_URL+"/auth/v1/"+path,{method,headers:{
  "apikey":SB_KEY,"Content-Type":"application/json",
  ...(token?{"Authorization":"Bearer "+token}:{})
 },body:body===undefined?undefined:JSON.stringify(body),cache:"no-store",referrerPolicy:"no-referrer"});
 const d=await r.json().catch(()=>({}));
 if(!r.ok){const err=new Error(d.msg||d.message||d.error_description||d.error||"Supabase authentication failed");err.status=r.status;throw err;}
 return d;
}
async function init(){
 const hash=new URLSearchParams(location.hash.slice(1));
 const query=new URLSearchParams(location.search);
 // Clear recovery tokens from browser history immediately, before any network request.
 history.replaceState(null,"",location.pathname);
 if(hash.get("error")||query.get("error")){
  alertError("This reset link is invalid or has expired. Request a new one.");return;
 }
 let access=hash.get("access_token");
 const type=hash.get("type")||query.get("type");
 const tokenHash=query.get("token_hash");
 try{
  // Direct token_hash links are supported when using a customized Supabase recovery template.
  if(!access&&tokenHash&&type==="recovery"){
   const session=await api("verify",{method:"POST",body:{token_hash:tokenHash,type:"recovery"}});
   access=session.access_token;
  }
  if(!access){
   if(location.hash||query.get("code"))alertError("This link could not be verified. Request a new password email.");
   return;
  }
  if(type!=="recovery"){alertError("This link is not a password recovery link.");return;}
  const user=await api("user",{token:access});
  if(!user?.id||!user.email_confirmed_at){alertError("The recovery session could not be verified.");return;}
  recoveryToken=access;show("set-panel");$("new-password").focus();
 }catch(e){alertError("The recovery session could not be verified. Request a new link.");}
}
$("recovery-form").addEventListener("submit",async e=>{
 e.preventDefault();
 const email=$("recovery-email").value.trim().toLowerCase();
 if(!$("recovery-form").reportValidity())return;
 $("send-link").disabled=true;$("request-message").textContent="Requesting a secure recovery email…";
 try{
  await api("recover?redirect_to="+encodeURIComponent(REDIRECT),{method:"POST",body:{email}});
  $("request-message").textContent="If this address has an OCCIVO administrator account, a recovery email should arrive shortly. Check your inbox and spam folder. If none arrives, verify the Supabase email and redirect settings.";
 }catch(err){
  $("request-message").textContent=err.status===429?"Too many attempts. Please try later.":"The recovery email could not be requested. Check Supabase Auth email settings or try again.";
 }finally{$("send-link").disabled=false;}
});
$("password-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!recoveryToken)return alertError("Your recovery session is missing. Request a new link.");
 const password=$("new-password").value;
 if(password.length<14){$("set-message").textContent="Use at least 14 characters.";return;}
 if(password!==$("confirm-password").value){$("set-message").textContent="Passwords do not match.";return;}
 $("save-password").disabled=true;$("set-message").textContent="Updating your password…";
 try{
  await api("user",{method:"PUT",body:{password},token:recoveryToken});
  const expiredToken=recoveryToken;recoveryToken="";
  $("new-password").value="";$("confirm-password").value="";
  show("complete-panel");
  // A reset should not leave a session active in the browser.
  await api("logout",{method:"POST",token:expiredToken}).catch(()=>{});
 }catch(err){
  $("set-message").textContent=err.message||"Unable to update the password. Please request a new link.";
 }finally{$("save-password").disabled=false;}
});
init();
