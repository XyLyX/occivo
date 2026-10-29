"use strict";
const briefForm=document.getElementById("brief-form");
const requestForm=document.getElementById("request-form");
const steps={brief:document.getElementById("step-brief"),ideas:document.getElementById("step-ideas"),request:document.getElementById("step-request")};
const progress=document.getElementById("progress");const conceptsEl=document.getElementById("concepts");const statusEl=document.getElementById("request-status");
let brief=null;let concepts=[];let chosen=0;
function showStep(step){for(const [key,element] of Object.entries(steps)){element.classList.toggle("active",key===step);}progress.textContent=step==="brief"?"STEP 1 OF 2 · YOUR GIFTING BRIEF":step==="ideas"?"STEP 2 OF 2 · EXPLORE IDEAS":"YOUR REQUEST · PERSONAL CONCIERGE";steps[step].querySelector("h2").setAttribute("tabindex","-1");steps[step].querySelector("h2").focus();}
function value(name){return new FormData(briefForm).get(name)||""}
function localConcepts(data){const relationship=data.recipient.toLowerCase();const occasion=data.occasion.toLowerCase();const isWork=relationship.includes("client")||relationship.includes("colleague");const isHome=occasion.includes("housewarming");return[{style:"The Safe Choice",title:isHome?"A considered home accent":isWork?"A refined desk or lifestyle essential":"A beautifully presented everyday indulgence",description:"A versatile, quality-first gifting direction that feels useful without losing a sense of occasion.",why:"Appropriate when personal taste is not fully known.",presentation:"A restrained luxury box with a personal note."},{style:"The Personal Choice",title:isHome?"Something chosen for their new space":"A gift inspired by what makes them unique",description:"Bring the recipient's interests, routines or a shared memory into the selection.",why:"Creates emotional value beyond the item's price.",presentation:"A thoughtful card and curated presentation."},{style:"The Standout Choice",title:isWork?"A distinguished appreciation set":"A memorable occasion set",description:"A deliberately composed set of complementary items with a strong unboxing moment.",why:"Designed for an important milestone without relying on extravagance.",presentation:"A signature luxury gift-box arrangement."}]}
function renderConcepts(items){conceptsEl.replaceChildren();items.forEach((item,index)=>{const label=document.createElement("label");label.className="concept";const radio=document.createElement("input");radio.type="radio";radio.name="concept";radio.value=String(index);radio.checked=index===chosen;radio.addEventListener("change",()=>chosen=index);const title=document.createElement("h3");title.textContent=item.style;const name=document.createElement("strong");name.textContent=item.title;const description=document.createElement("p");description.textContent=item.description;const why=document.createElement("p");why.textContent=item.why;const present=document.createElement("p");present.textContent=item.presentation;present.className="muted small";label.append(radio,title,name,description,why,present);conceptsEl.append(label);});}
briefForm.addEventListener("submit",async(event)=>{event.preventDefault();if(!briefForm.reportValidity())return;brief={recipient:value("recipient"),occasion:value("occasion"),budget:value("budget"),timing:value("timing"),preferences:String(value("preferences")).trim().slice(0,800)};const btn=document.getElementById("ideas-btn");btn.disabled=true;btn.textContent="Considering your ideas…";let ai=false;try{const res=await fetch("/api/recommend",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(brief),signal:AbortSignal.timeout(12000)});if(res.ok){const data=await res.json();if(Array.isArray(data.concepts)&&data.concepts.length===3){concepts=data.concepts;ai=true;}}}catch(_error){}if(!ai)concepts=localConcepts(brief);document.getElementById("idea-note").textContent=ai?"AI-assisted concepts based on your brief. Nothing here represents confirmed stock or pricing.":"Illustrative gift directions based on your answers; live AI curation is not configured yet.";chosen=0;renderConcepts(concepts);btn.disabled=false;btn.textContent="Explore three gift ideas →";showStep("ideas");});
document.getElementById("back-btn").addEventListener("click",()=>showStep("brief"));
document.getElementById("continue-btn").addEventListener("click",()=>{document.getElementById("request-brief").value=JSON.stringify(brief);document.getElementById("selected-concept").value=JSON.stringify(concepts[chosen]);showStep("request")});
document.getElementById("request-back").addEventListener("click",()=>showStep("ideas"));
requestForm.addEventListener("submit",async(event)=>{
 event.preventDefault();if(!requestForm.reportValidity())return;
 const data=new FormData(requestForm);
 const payload={customer_name:String(data.get("customer_name")||""),customer_email:String(data.get("customer_email")||""),customer_phone:String(data.get("customer_phone")||""),message:String(data.get("message")||""),brief,concept:concepts[chosen],permission:data.get("permission")==="yes",honeypot:String(data.get("bot-field")||"")};
 const btn=document.getElementById("request-submit");btn.disabled=true;
 statusEl.textContent="Securely submitting your gifting request…";
 try{
  const response=await fetch("/api/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||!result.accepted||!result.reference)throw Error(result.error||"Submission could not be confirmed");
  statusEl.textContent="Request "+result.reference+" received. Please keep this reference. No order or delivery is confirmed yet.";
  requestForm.reset();btn.textContent="Request received";btn.disabled=true;
 }catch(error){
  statusEl.textContent="Your request was NOT saved. "+(error.message||"Please try again.")+" You can contact concierge@occivo.com directly.";
  btn.disabled=false;
 }
});
