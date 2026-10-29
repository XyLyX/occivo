// Server-side only. Never import this into a browser bundle.
export const env=(key)=>globalThis.Netlify?.env?.get?.(key) || process.env[key] || "";
export const supa=()=>(env("SUPABASE_URL")||"https://vtpaxzptyyggapnlkoma.supabase.co").replace(/\/$/,"");
export const pub=()=>env("SUPABASE_PUBLISHABLE_KEY")||"sb_publishable_8RVKrrjBGnF5q6bbHRSi9w_K575VkTZ";
export const secret=()=>env("SUPABASE_SECRET_KEY");
export const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});
export const trim=(x,max=250)=>typeof x==="string"?x.trim().slice(0,max):"";
export const ready=()=>Boolean(supa()&&pub()&&secret());
export async function db(path,options={}){
  const key=secret();if(!ready())throw Error("Configuration unavailable");
  const result=await fetch(supa()+"/rest/v1/"+path,{...options,headers:{"apikey":key,"Content-Type":"application/json","Accept":"application/json","Cache-Control":"no-store",...(options.headers||{})}});
  if(!result.ok)throw Error("Database operation failed ("+result.status+")");
  const text=await result.text();return text?JSON.parse(text):null;
}
export async function validateAdmin(request){
 const auth=request.headers.get("authorization")||"";
 if(!auth.startsWith("Bearer ")||!pub()||!supa())return false;
 const token=auth.slice(7);
 if(token.length>7000||token.length<30)return false;
 const result=await fetch(supa()+"/auth/v1/user",{headers:{"apikey":pub(),"Authorization":"Bearer "+token,"Cache-Control":"no-store"}});
 if(!result.ok)return false;
 const user=await result.json();
 if(user.email?.toLowerCase()!=="admin@occivo.com"||!user.email_confirmed_at)return false;
 // Supabase has already verified the session JWT; read its verified AAL claim.
 const part=token.split(".")[1];if(!part)return false;
 let claims;
 try{claims=JSON.parse(atob(part.replace(/-/g,"+").replace(/_/g,"/")))}catch{return false}
 return claims.sub===user.id&&claims.aal==="aal2";
}
