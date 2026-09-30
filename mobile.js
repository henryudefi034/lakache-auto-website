document.addEventListener('DOMContentLoaded',function(){
 var nav=document.querySelector('nav');var links=nav&&nav.querySelector('.links');
 /* Enterprise expansion: expose vehicle inventory site-wide without rewriting every approved page. */
 if(links&&!links.querySelector('a[href="cars-for-sale.html"]')){
  var sale=document.createElement('a');sale.href='cars-for-sale.html';sale.textContent='CARS FOR SALE';
  var shop=links.querySelector('a[href="shop.html"]');if(shop)links.insertBefore(sale,shop);else links.appendChild(sale);
 }
 if(nav&&links){var button=document.createElement('button');button.className='mobile-toggle';button.type='button';button.setAttribute('aria-label','Open navigation');button.setAttribute('aria-expanded','false');button.innerHTML='<span></span><span></span><span></span>';nav.appendChild(button);function closeMenu(){links.classList.remove('open');document.body.classList.remove('menu-open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open navigation')}button.addEventListener('click',function(){var open=!links.classList.contains('open');links.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close navigation':'Open navigation')});links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeMenu)});window.addEventListener('resize',function(){if(window.innerWidth>800)closeMenu()});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()})}

 /* Vehicle inquiry routing: each listing carries its own identity into Contact. */
 var vehicleCatalog={
  gti:{name:'2024 Volkswagen GTI Autobahn',short:'THE GTI',subject:'2024 VW GTI Autobahn - Buyer Inquiry',question:'Questions about the GTI:'},
  bmw550i:{name:'2016 BMW 550i M Sport',short:'THE BMW 550i',subject:'2016 BMW 550i M Sport - Buyer Inquiry',question:'Questions about the BMW 550i:'}
 };
 var currentPage=location.pathname.split('/').pop()||'index.html';
 var pageVehicle=currentPage==='vehicle-listing-gti-demo.html'?'gti':currentPage==='vehicle-listing-bmw-550i.html'?'bmw550i':'';
 if(pageVehicle){
  document.querySelectorAll('a[href="contact.html"]').forEach(function(a){
   if(a.closest('.cta')||/ASK ABOUT/i.test(a.textContent||''))a.href='contact.html?vehicle='+encodeURIComponent(pageVehicle)+'#vehicle-inquiry';
  });
 }
 if(currentPage==='contact.html'){
  var key=new URLSearchParams(location.search).get('vehicle');var vehicle=vehicleCatalog[key];
  var buyer=document.querySelector('#vehicle-inquiry');
  if(buyer){
   var vehicleBox=buyer.querySelector('.vehicle');var buyerCopy=buyer.querySelector('.buyer-copy');var mailbtn=buyer.querySelector('.mailbtn');
   if(vehicle){
    if(vehicleBox){var small=vehicleBox.querySelector('small'),strong=vehicleBox.querySelector('strong');if(small)small.textContent='VEHICLE INQUIRY';if(strong)strong.textContent=vehicle.name;}
    if(buyerCopy)buyerCopy.textContent='Send the basics that help us respond intelligently. The vehicle is already identified in the email subject so your inquiry does not get mixed in with general messages.';
    if(mailbtn){var body='Name:\n\nPhone:\n\nLocation:\n\nBuying timeline:\n\nCash / Financing / Undecided:\n\nTrade-in (if any):\n\n'+vehicle.question+'\n';mailbtn.href='mailto:info@lakache.com?subject='+encodeURIComponent(vehicle.subject)+'&body='+encodeURIComponent(body);mailbtn.textContent='ASK ABOUT '+vehicle.short+' →';}
   }else{
    if(vehicleBox){var small2=vehicleBox.querySelector('small'),strong2=vehicleBox.querySelector('strong');if(small2)small2.textContent='VEHICLE BUYER INQUIRY';if(strong2)strong2.textContent='Which vehicle are you interested in?';}
    if(buyerCopy)buyerCopy.textContent='Coming from a vehicle listing? Use the inquiry button on that car and we will identify it automatically. For a general vehicle question, you can still contact Lakache Auto here.';
    if(mailbtn){var genericBody='Name:\n\nPhone:\n\nLocation:\n\nVehicle you are interested in:\n\nBuying timeline:\n\nQuestions / message:\n';mailbtn.href='mailto:info@lakache.com?subject='+encodeURIComponent('Lakache Auto - Vehicle Buyer Inquiry')+'&body='+encodeURIComponent(genericBody);mailbtn.textContent='VEHICLE INQUIRY →';}
   }
  }
 }

 /* Final site audit: normalize brand language and basic link/accessibility behavior. */
 document.querySelectorAll('footer').forEach(function(footer){
  var text=footer.textContent||'';
  if(/CARS\s*[•·]\s*BUILDS?\s*[•·]\s*LIFE/i.test(text)||/CARS\s+BUILDS?\s+LIFE/i.test(text)){
   footer.innerHTML=footer.innerHTML.replace(/CARS\s*(?:•|·)\s*(?:<[^>]+>)*BUILDS?(?:<\/[^>]+>)*\s*(?:•|·)\s*LIFE/gi,'CARS BUILD LIFE').replace(/CARS\s+BUILDS?\s+LIFE/gi,'CARS BUILD LIFE');
  }
 });
 document.querySelectorAll('a[target="_blank"]').forEach(function(a){var rel=(a.getAttribute('rel')||'').split(/\s+/).filter(Boolean);if(rel.indexOf('noopener')<0)rel.push('noopener');a.setAttribute('rel',rel.join(' '))});
 var origin=document.querySelector('.beginning');if(origin&&!origin.id)origin.id='origin';
 if(nav){nav.querySelectorAll('a').forEach(function(a){var href=a.getAttribute('href');if(!href)return;var current=location.pathname.split('/').pop()||'index.html';if(href===current||href==='index.html'&&current===''){a.setAttribute('aria-current','page')}})}

 /* Lakache red accent pass. Keep the palette mostly monochrome and let red punctuate the story. */
 function wrapPhrase(root,phrase,cls){
  if(!root||root.querySelector('.'+cls))return;
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);var node;
  while(node=walker.nextNode()){
   var i=node.nodeValue.indexOf(phrase);if(i<0)continue;
   var before=node.nodeValue.slice(0,i),after=node.nodeValue.slice(i+phrase.length),span=document.createElement('span');span.className=cls;span.textContent=phrase;
   var frag=document.createDocumentFragment();if(before)frag.appendChild(document.createTextNode(before));frag.appendChild(span);if(after)frag.appendChild(document.createTextNode(after));node.parentNode.replaceChild(frag,node);return;
  }
 }
 function redPeriod(el){
  if(!el||el.querySelector('.brand-period'))return;
  var walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);var nodes=[],n;while(n=walker.nextNode())nodes.push(n);
  for(var i=nodes.length-1;i>=0;i--){var text=nodes[i].nodeValue;var m=text.match(/\.\s*$/);if(!m)continue;var pos=text.lastIndexOf('.'),span=document.createElement('span');span.className='brand-period';span.textContent='.';var tail=text.slice(pos+1),frag=document.createDocumentFragment();frag.appendChild(document.createTextNode(text.slice(0,pos)));frag.appendChild(span);if(tail)frag.appendChild(document.createTextNode(tail));nodes[i].parentNode.replaceChild(frag,nodes[i]);break}
 }
 document.querySelectorAll('h1,h2').forEach(redPeriod);
 var accents=[
  ['.hero p','real ownership stories'],
  ['.hero p','finished drive'],
  ['.head p','Real results'],
  ['.feature p','would I buy it again'],
  ['.manifesto p','sharing what was learned'],
  ['.intro p','full process'],
  ['.intro p','finished result'],
  ['.lede','real experience'],
  ['.lede','damaged cars back to life'],
  ['.pillar p','passion'],
  ['.pillar p','rebuilds'],
  ['.pillar p','Cars build more than cars']
 ];
 accents.forEach(function(a){document.querySelectorAll(a[0]).forEach(function(el){wrapPhrase(el,a[1],'brand-red')})});
 document.querySelectorAll('.pillar small').forEach(function(el,index){wrapPhrase(el,String(index+1).padStart(2,'0'),'brand-red')});
 document.querySelectorAll('.eyebrow,.kicker,.drop').forEach(function(el){wrapPhrase(el,'CURRENT PROJECT','brand-red');wrapPhrase(el,'COMING SOON','brand-red');wrapPhrase(el,'FEATURED','brand-red')});
});
