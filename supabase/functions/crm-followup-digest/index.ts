// Lakache Auto CRM daily follow-up digest.
// Deploy as a separate Supabase Edge Function named crm-followup-digest.
// Disable JWT verification for scheduled invocation; require the private CRON_SECRET header.
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, CRON_SECRET.
import { createClient } from "npm:@supabase/supabase-js@2";
const zone="America/Los_Angeles";
const response=(status:number,body:Record<string,unknown>)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const dayInLA=(d:Date)=>new Intl.DateTimeFormat("en-CA",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
Deno.serve(async req=>{
  if(req.method!=="POST")return response(405,{error:"Method not allowed"});
  const secret=Deno.env.get("CRON_SECRET");
  if(!secret||req.headers.get("x-cron-secret")!==secret)return response(401,{error:"Unauthorized"});
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),resend=Deno.env.get("RESEND_API_KEY");
  if(!url||!key||!resend)return response(503,{error:"Missing required configuration"});
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const today=dayInLA(new Date());
  // Date-only comparison avoids timezone and DST surprises in the business work queue.
  const {data:inquiries,error}=await db.from("crm_inquiries").select("id,buyer_id,vehicle_interest,status,follow_up_at").not("follow_up_at","is",null).not("status","in",'("won","lost","closed")').order("follow_up_at",{ascending:true}).limit(1000);
  if(error)return response(500,{error:"Unable to read follow-ups"});
  const due=(inquiries||[]).filter(i=>dayInLA(new Date(i.follow_up_at))<=today);
  if(!due.length)return response(200,{ok:true,due:0,sent:false});
  const {data:buyers,error:buyerError}=await db.from("crm_buyers").select("id,full_name,email,verification_status").in("id",[...new Set(due.map(i=>i.buyer_id).filter(Boolean))]);
  if(buyerError)return response(500,{error:"Unable to read buyers"});
  const byId=new Map((buyers||[]).map(b=>[b.id,b]));
  const lines=due.map((i,n)=>{
    const b=byId.get(i.buyer_id);
    return [`${n+1}. ${i.vehicle_interest||"General inquiry"}`,`Buyer: ${b?.full_name||"Unlinked buyer"}`,`Email: ${b?.email||"Not provided"}`,`Verification: ${b?.verification_status||"Unknown"}`,`Stage: ${i.status}`,`Follow-up: ${dayInLA(new Date(i.follow_up_at))}`,`Inquiry ID: ${i.id}`].join("\n");
  });
  // Unique reminder_date claim prevents overlapping invocations from sending twice.
  const claim=await db.from("crm_followup_digest_runs").insert({reminder_date:today,status:"processing"}).select("reminder_date").single();
  if(claim.error){
    if(claim.error.code==="23505")return response(200,{ok:true,duplicate:true,sent:false});
    return response(500,{error:"Unable to claim daily reminder"});
  }
  try{
    const sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${resend}`,"Content-Type":"application/json"},body:JSON.stringify({
      from:"Lakache Auto CRM <notifications@lakacheautos.com>",
      to:["sales@lakacheautos.com"],
      subject:`Lakache Auto | ${due.length} follow-up${due.length===1?"":"s"} due | ${today}`,
      text:[`Lakache Auto CRM follow-ups due or overdue as of ${today} (Pacific time).`,"",...lines.flatMap(x=>[x,""]), "Open the private CRM: https://lakacheautos.com/crm.html","This is an internal operational reminder."].join("\n")
    })});
    if(!sent.ok){console.error("Digest Resend rejected",{status:sent.status});await db.from("crm_followup_digest_runs").update({status:"failed"}).eq("reminder_date",today);return response(502,{error:"Email provider did not accept reminder"})}
    const tracked=await db.from("crm_followup_digest_runs").update({status:"accepted",accepted_at:new Date().toISOString(),due_count:due.length}).eq("reminder_date",today);
    if(tracked.error)console.error("Digest tracking failed",{code:tracked.error.code});
    return response(200,{ok:true,sent:true,due:due.length});
  }catch(e){console.error("Digest send exception",String(e));await db.from("crm_followup_digest_runs").update({status:"failed"}).eq("reminder_date",today);return response(502,{error:"Reminder request failed"})}
});
