"use strict";
const form=document.getElementById("gift-intake");
const $=(id)=>document.getElementById(id);
const setConditional=(controller,value,wrap,input,required=false)=>{
 const active=$(controller).value===value;
 $(wrap).classList.toggle("hidden",!active);
 $(input).required=active&&required;
 if(!active)$(input).value="";
};
function sync(){
 setConditional("recipient","Other","recipient-other-wrap","recipient-other",true);
 setConditional("recipient","Child","child-age-wrap","child-age",true);
 setConditional("occasion","Other","occasion-other-wrap","occasion-other",true);
 setConditional("destination","Dubai","dubai-area-wrap","dubai-area",false);
 setConditional("presentation","Include a handwritten card","card-message-wrap","card-message",false);
}
for(const id of ["recipient","occasion","destination","presentation"])$(id).addEventListener("change",sync);
sync();
const trim=(name,max=250)=>String(new FormData(form).get(name)||"").trim().slice(0,max);
form.addEventListener("submit",async event=>{
 event.preventDefault();sync();
 if(!form.reportValidity())return;
 const fd=new FormData(form);
 const brief={
   recipient:trim("recipient",70),recipient_name:trim("recipient_name",60),
   recipient_other:trim("recipient_other",80),child_age:trim("child_age",3),
   occasion:trim("occasion",80),occasion_other:trim("occasion_other",80),
   timing:trim("timing",50),budget:trim("budget",50),
   destination:trim("destination",50),dubai_area:trim("dubai_area",80),
   about_them:trim("about_them",200),
   directions:fd.getAll("direction").filter(x=>typeof x==="string").slice(0,9),
   avoid:trim("avoid",300),presentation:trim("presentation",100),
   card_message:trim("card_message",280),other_notes:trim("other_notes",500)
 };
 const payload={
   customer_name:null,customer_email:trim("customer_email",200),
   customer_phone:trim("customer_phone",45),
   brief,permission:fd.get("permission")==="on",
   honeypot:trim("bot-field",100)
 };
 const button=$("request-submit");
 button.disabled=true;button.textContent="Submitting securely…";
 $("request-status").textContent="Saving your request securely…";
 try{
   const response=await fetch("/api/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),cache:"no-store"});
   const result=await response.json().catch(()=>({}));
   if(!response.ok||!result.accepted||!result.reference)throw new Error(result.error||"Submission could not be confirmed");
   $("confirmation-reference").textContent=result.reference;
   $("confirmation-email").textContent=payload.customer_email;
   $("intake-shell").classList.add("hidden");
   $("confirmation").classList.remove("hidden");
   $("confirmation").focus();
 }catch(err){
   $("request-status").textContent="Your request was not confirmed or may not have been saved. "+(err.message||"Please try again.")+" If uncertain, email concierge@occivo.com before submitting again.";
   button.disabled=false;button.textContent="Start my gifting conversation →";
 }
});