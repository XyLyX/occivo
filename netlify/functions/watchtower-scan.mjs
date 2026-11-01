import {runWatchtower} from "../../lib/watchtower-service.mjs";
// Runs every 30 minutes UTC; private scheduled Netlify function, not a public URL.
// Does not send customer mail or create commitments.
export default async function handler(){
 try{
  const result=await runWatchtower();
  console.info("OCCIVO Watchtower scan",JSON.stringify(result));
 }catch(err){
  console.error("OCCIVO Watchtower scan failed:",err?.message||"Unknown error");
  throw err;
 }
}
export const config={schedule:"*/30 * * * *"};
