// Supabase Edge Function: public wholesale inquiry ingestion.
// Deploy with --no-verify-jwt. Requires TURNSTILE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY
// in Supabase Edge Function secrets. Do NOT expose these to the browser.
import { createClient } from "npm:@supabase/supabase-js@2";
const ORIGIN = "https://lakacheautos.com";
const headers = {"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type","Content-Type":"application/json","Vary":"Origin"};
const reply=(status:number,data:Record<string,unknown>)=>new Response(JSON.stringify(data),{status,headers});
const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(req.method!=="POST")return reply(405,{error:"Method not allowed"});
  if(req.headers.get("origin")!==ORIGIN)return reply(403,{error:"Invalid origin"});
  const len=Number(req.headers.get("content-length")||0);
  if(len>12000)return reply(413,{error:"Submission too large"});
  let data:Record<string,unknown>;
  try{data=await req.json();if(!data||typeof data!=="object"||Array.isArray(data))throw Error()}catch{return reply(400,{error:"Invalid JSON"})}
  // Honeypot: automated clients commonly populate this hidden field.
  if(clean(data.website,100))return reply(200,{ok:true});
  const name=clean(data.name,120),email=clean(data.email,254),phone=clean(data.phone,60);
  const message=clean(data.message,4000),vehicle=clean(data.vehicle_interest,200);
  const country=clean(data.destination_country,100),company=clean(data.company,150);
  const buyerType=clean(data.buyer_type,100),token=clean(data.turnstile_token,3000);
  if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!message||!token)return reply(400,{error:"Name, valid email, message and verification required"});
  const secret=Deno.env.get("TURNSTILE_SECRET_KEY");
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const url=Deno.env.get("SUPABASE_URL");
  if(!secret||!service||!url)return reply(503,{error:"Integration not configured"});
  try{
    const verification=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({secret,response:token})});
    const result=await verification.json();
    if(!result.success||result.hostname!=="lakacheautos.com")return reply(403,{error:"Verification failed. Please try again."});
    const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    // New record per inquiry, avoiding accidental merges with unrelated buyers sharing email.
    const buyer=await db.from("crm_buyers").insert({full_name:name,email,phone:phone||null,company:company||null,buyer_type:buyerType||null,destination_country:country||null,marketing_consent:false,verification_status:"unverified"}).select("id").single();
    if(buyer.error)throw buyer.error;
    const inquiry=await db.from("crm_inquiries").insert({buyer_id:buyer.data.id,vehicle_interest:vehicle||null,message,source:"website",status:"new"}).select("id").single();
    if(inquiry.error){await db.from("crm_buyers").delete().eq("id",buyer.data.id);throw inquiry.error}

    // A notification failure never rolls back the successfully saved inquiry.
    const resendKey=Deno.env.get("RESEND_API_KEY");
    if(resendKey){
      try{
        const notice=await fetch("https://api.resend.com/emails",{
          method:"POST",
          headers:{"Authorization":`Bearer ${resendKey}`,"Content-Type":"application/json"},
          body:JSON.stringify({
            from:"Lakache Auto CRM <notifications@lakacheautos.com>",
            to:["sales@lakacheautos.com"],
            subject:"New wholesale inquiry — Lakache Auto",
            text:[
              "A new wholesale inquiry has been saved in the private CRM.",
              `Buyer: ${name}`,`Email: ${email}`,
              `Phone: ${phone||"Not provided"}`,
              `Vehicle: ${vehicle||"General inquiry"}`,
              `Destination: ${country||"Not provided"}`,
              `Buyer type: ${buyerType||"Not provided"}`,
              `Inquiry ID: ${inquiry.data.id}`,
              "Log in to the private CRM to review the inquiry and arrange follow-up."
            ].join("\n")
          })
        });
        if(!notice.ok)console.error("CRM notification failed",{status:notice.status,inquiryId:inquiry.data.id});
      }catch(err){console.error("CRM notification exception",{inquiryId:inquiry.data.id,error:String(err)})}
    }else console.error("CRM notification key missing",{inquiryId:inquiry.data.id});

    // Transactional receipt confirmation. Never imply eligibility or availability.
    // This is independent of the CRM save and the internal notification.
    if(resendKey){
      try{
        const receipt=await fetch("https://api.resend.com/emails",{
          method:"POST",
          headers:{"Authorization":`Bearer ${resendKey}`,"Content-Type":"application/json"},
          body:JSON.stringify({
            from:"Lakache Auto <notifications@lakacheautos.com>",
            to:[email],
            reply_to:"sales@lakacheautos.com",
            subject:"We received your inquiry | Lakache Auto",
            text:[
              `Hello ${name},`,
              "",
              "Thank you for contacting Lakache Auto. We received your wholesale vehicle inquiry.",
              `Vehicle interest: ${vehicle||"General inquiry"}`,
              `Reference: ${inquiry.data.id}`,
              "",
              "Our team will review your request and follow up using the contact details you provided. We may need to confirm business and purchasing eligibility before discussing transaction terms.",
              "This acknowledgment does not confirm vehicle availability, pricing, eligibility, or acceptance of any transaction.",
              "",
              "If you need to correct your inquiry, reply to this email and include the reference above.",
              "",
              "Lakache Auto",
              "sales@lakacheautos.com",
              "https://lakacheautos.com"
            ].join("\\n")
          })
        });
        if(!receipt.ok)console.error("CRM buyer acknowledgment failed",{status:receipt.status,inquiryId:inquiry.data.id});
      }catch(err){console.error("CRM buyer acknowledgment exception",{inquiryId:inquiry.data.id,error:String(err)})}
    }
    return reply(200,{ok:true});
  }catch(e){console.error("CRM ingestion error",e);return reply(500,{error:"Unable to save inquiry. Please try again."})}
});
