import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const adminJS=readFileSync("public/admin.js","utf8");
const fakeJWT=level=>"header."+Buffer.from(JSON.stringify({aal:level})).toString("base64url")+".signature";

function stubElement() {
  const classes=new Set(["hidden"]);
  return {
    value:"",src:"",textContent:"",listeners:{},
    classList:{
      add:x=>classes.add(x),
      remove:x=>classes.delete(x),
      toggle:(x,yes)=>{if(yes)classes.add(x);else classes.delete(x)},
      contains:x=>classes.has(x)
    },
    addEventListener(type,callback){this.listeners[type]=callback},
    focus(){},
    append(){},
    replaceChildren(){},
    scrollIntoView(){},
    setAttribute(){},
    getAttribute(){return null}
  };
}
function makeHarness({factors=[],challenge=false}={}){
  const elements={};
  const $=id=>elements[id]??=(stubElement());
  const calls=[];
  const fetched=async(url,opts={})=>{
    const path=new URL(url,"https://occivo.netlify.app").pathname;
    const method=opts.method||"GET";
    calls.push({path,method});
    const response=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{"Content-Type":"application/json"}});
    if(path==="/auth/v1/token"&&method==="POST")return response({access_token:fakeJWT("aal1")});
    if(path==="/auth/v1/user"&&method==="GET")return response({id:"admin-user",email_confirmed_at:"2026-10-30T08:00:00Z",factors});
    if(path==="/auth/v1/factors"&&method==="POST")return response({id:"new-factor",totp:{qr_code:"<svg xmlns='http://www.w3.org/2000/svg'></svg>"}});
    if(path==="/auth/v1/factors/factor-old/challenge"||path==="/auth/v1/factors/new-factor/challenge")return response({id:"challenge-1"});
    if(path==="/auth/v1/factors/factor-old/verify"||path==="/auth/v1/factors/new-factor/verify")return response({access_token:fakeJWT("aal2")});
    if(path==="/api/admin-requests")return response({requests:[]});
    throw new Error("Unexpected endpoint: "+method+" "+path);
  };
  const ctx={document:{getElementById:$,createElement:stubElement},fetch:fetched,Response,URL,JSON,FormData,atob,encodeURIComponent,console};
  vm.runInNewContext(adminJS,ctx,{filename:"public/admin.js"});
  $("email").value="operator@example.test";
  $("password").value="test-not-a-real-password";
  return {$,calls,submit:async()=>{$("login-form").listeners.submit({preventDefault(){}})}};
}

test("new admin password is accepted and first MFA enrollment uses the user record",async()=>{
  const h=makeHarness({factors:[]});
  await h.submit();
  assert.equal(h.$("login-message").textContent,"");
  assert.equal(h.$("mfa-panel").classList.contains("hidden"),false);
  assert.equal(h.$("mfa-qr").classList.contains("hidden"),false);
  assert.match(h.$("mfa-qr").src,/^data:image\/svg\+xml/);
  assert.equal(h.calls.filter(c=>c.path==="/auth/v1/factors"&&c.method==="POST").length,1);
  assert.equal(h.calls.filter(c=>c.path==="/auth/v1/factors"&&c.method==="GET").length,0);
});

test("verified MFA factor is selected without redundant enrollment",async()=>{
  const h=makeHarness({factors:[{factor_type:"totp",status:"verified",id:"factor-old"}]});
  await h.submit();
  assert.equal(h.$("login-message").textContent,"");
  assert.equal(h.$("mfa-panel").classList.contains("hidden"),false);
  assert.equal(h.$("mfa-qr").classList.contains("hidden"),true);
  assert.equal(h.calls.filter(c=>c.path==="/auth/v1/factors"&&c.method==="POST").length,0);
  h.$("mfa-code").value="123456";
  await h.$("mfa-form").listeners.submit({preventDefault(){}});
  assert.equal(h.$("dashboard").classList.contains("hidden"),false);
  assert.equal(h.calls.some(c=>c.path==="/api/admin-requests"),true);
  assert.equal(h.calls.some(c=>c.path==="/auth/v1/factors"&&c.method==="GET"),false);
});
