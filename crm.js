(async function(){
'use strict';
const $=id=>document.getElementById(id), config=window.LAKACHE_CRM_CONFIG||{};
const show=(id,on)=>{$(id).hidden=!on}, notice=s=>{$('message').textContent=s};
if(!config.url||!config.publishableKey){show('setup',true);return}
if(!window.supabase){notice('Supabase library failed to load. Refresh the page.');return}
const client=window.supabase.createClient(config.url,config.publishableKey,{auth:{autoRefreshToken:true,persistSession:true}});
show('setup',false);
let inquiries=[],buyers=[],admin=false,editing=null;
const fields={
 buyer:[['full_name','Full name','text',true],['email','Email','email'],['phone','Phone','tel'],['company','Company','text'],['buyer_type','Buyer type','text'],['destination_country','Destination country','text'],['verification_status','Verification status','select',false,['unverified','pending','verified','rejected']],['notes','Internal notes','textarea']],
 inquiry:[['buyer_id','Buyer','buyer'],['vehicle_interest','Vehicle interest','text'],['message','Inquiry details','textarea'],['status','Status','select',false,['new','qualifying','follow_up','negotiating','won','lost','closed']],['follow_up_at','Follow-up date','date']]
};
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function addField(container,definition,value){const [name,title,type,required,opts]=definition,label=el('label',title);let input;
if(type==='select'||type==='buyer'){input=document.createElement('select');const options=type==='buyer'?[['','No linked buyer'],...buyers.map(b=>[b.id,b.full_name])]:opts.map(o=>[o,o]);options.forEach(([v,t])=>{const o=el('option',t);o.value=v;input.append(o)})}
else if(type==='textarea')input=document.createElement('textarea');
else{input=document.createElement('input');input.type=type==='date'?'date':type}
input.name=name;input.required=!!required;input.value=value==null?'':type==='date'?String(value).slice(0,10):String(value);label.append(input);container.append(label)}
function editor(type,record){editing={type,record};$('editor-title').textContent=(record?'Edit ':'New ')+(type==='buyer'?'buyer':'inquiry');$('record-fields').replaceChildren();fields[type].forEach(f=>addField($('record-fields'),f,record?.[f[0]]));$('editor').showModal()}
$('cancel').onclick=()=>$('editor').close();$('add-buyer').onclick=()=>editor('buyer',null);$('add-inquiry').onclick=()=>editor('inquiry',null);
$('record-form').onsubmit=async e=>{e.preventDefault();if(!admin)return;const {type,record}=editing;const payload=Object.fromEntries(new FormData(e.target).entries());for(const key of Object.keys(payload))if(payload[key]==='')payload[key]=null;if(type==='buyer'&&!payload.full_name){notice('Buyer name is required.');return}if(type==='inquiry'){payload.source=record?.source||'manual';if(payload.follow_up_at)payload.follow_up_at=new Date(payload.follow_up_at+'T12:00:00').toISOString()}
const table=type==='buyer'?'crm_buyers':'crm_inquiries';let query=record?client.from(table).update(payload).eq('id',record.id):client.from(table).insert(payload);const {error}=await query;if(error){notice('Save failed: '+error.message);return}$('editor').close();notice('Record saved.');await load()};
function render(){const q=$('filter').value.trim().toLowerCase();$('total').textContent=inquiries.length;$('new').textContent=inquiries.filter(i=>i.status==='new').length;$('followups').textContent=inquiries.filter(i=>i.status==='follow_up'||i.follow_up_at&&new Date(i.follow_up_at)<=new Date()).length;$('buyers-count').textContent=buyers.length;
$('buyers').replaceChildren();for(const b of buyers){const card=el('div',undefined,'record');card.append(el('strong',b.full_name),el('small',[b.company,b.destination_country,b.verification_status].filter(Boolean).join(' · ')));const btn=el('button','Edit','outline');btn.onclick=()=>editor('buyer',b);card.append(btn);$('buyers').append(card)}if(!buyers.length)$('buyers').append(el('p','No buyers yet.'));
$('inquiries').replaceChildren();for(const i of inquiries){const buyer=buyers.find(b=>b.id===i.buyer_id);if(q&&![i.vehicle_interest,i.status,i.message,buyer?.full_name].some(s=>String(s||'').toLowerCase().includes(q)))continue;const card=el('div',undefined,'record');card.append(el('strong',i.vehicle_interest||'General inquiry'),el('small',[buyer?.full_name||'Unlinked buyer',i.status,i.follow_up_at?('Follow up: '+new Date(i.follow_up_at).toLocaleDateString()):''].filter(Boolean).join(' · ')));const btn=el('button','Edit','outline');btn.onclick=()=>editor('inquiry',i);card.append(btn);$('inquiries').append(card)}if(!$('inquiries').childElementCount)$('inquiries').append(el('p','No matching inquiries.'))}
$('filter').oninput=render;
async function load(){const [b,i]=await Promise.all([client.from('crm_buyers').select('*').order('created_at',{ascending:false}).limit(500),client.from('crm_inquiries').select('*').order('created_at',{ascending:false}).limit(500)]);if(b.error||i.error){notice('Unable to load CRM records: '+(b.error||i.error).message);return}buyers=b.data;inquiries=i.data;render()}
async function state(){const {data:{user},error}=await client.auth.getUser();if(error||!user){admin=false;show('auth',true);show('app',false);show('logout',false);return}const res=await client.from('crm_admins').select('user_id').eq('user_id',user.id).maybeSingle();if(res.error||!res.data){admin=false;await client.auth.signOut();show('auth',true);show('app',false);show('logout',false);notice('Access denied. This account is not an approved Lakache Auto administrator.');return}admin=true;show('auth',false);show('app',true);show('logout',true);await load()}
$('login').onsubmit=async e=>{e.preventDefault();notice('Signing in…');const form=new FormData(e.target);const {error}=await client.auth.signInWithPassword({email:form.get('email'),password:form.get('password')});if(error){notice('Sign-in failed: '+error.message);return}notice('');await state()};
$('logout').onclick=async()=>{await client.auth.signOut();admin=false;show('app',false);show('logout',false);show('auth',true);notice('Signed out.')};await state();
})();
