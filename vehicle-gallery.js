(function(){
 var galleries={
  'build-gti.html':{
   anchor:'.generation-pair',
   position:'after',
   eyebrow:'06 / FINAL CONDITION',
   title:'THE FINISHED GTI.',
   description:'The finished build is documented in detail — exterior, interior and final-condition photography. Open any image for the full-screen viewer or continue through the complete photo archive.',
   caption:'2024 VW GTI AUTOBAHN / FINAL CONDITION',
   alt:'2024 Volkswagen GTI Autobahn final condition photo',
   label:'FINAL',
   initial:24,
   files:Array.from({length:51},function(_,i){return '2024-vw-gti-final-'+(i+1)+'.jpeg'})
  },
  'vehicle-listing-gti.html':{
   anchor:'.gallery, .photos, .vehicle-gallery, main',
   position:'append',
   eyebrow:'PHOTO ARCHIVE',
   title:'EXPLORE THE GTI.',
   description:'Review the finished condition in detail. Open any image for the full-screen viewer and continue through the complete photographic record.',
   caption:'2024 VW GTI AUTOBAHN / VEHICLE PHOTOS',
   alt:'2024 Volkswagen GTI Autobahn vehicle photo',
   label:'PHOTO',
   initial:24,
   files:Array.from({length:51},function(_,i){return '2024-vw-gti-final-'+(i+1)+'.jpeg'})
  }
 };
 function init(){
  var page=location.pathname.split('/').pop()||'index.html',cfg=galleries[page];if(!cfg)return;
  var existing=document.querySelector('.vehicle-photo-archive[data-gallery-managed="true"]');if(existing)return;
  var anchor=document.querySelector(cfg.anchor);if(!anchor)return;
  var files=cfg.files||[],total=files.length;if(!total)return,initial=Math.min(cfg.initial||24,total);
  var section=document.createElement('section');section.className='vehicle-photo-archive';section.dataset.galleryManaged='true';
  section.innerHTML='<div class="vehicle-photo-head"><div class="k">'+cfg.eyebrow+'</div><h2>'+cfg.title+'</h2><p>'+cfg.description+'</p></div><div class="vehicle-photo-grid"></div><div class="vehicle-gallery-actions"><button class="vehicle-gallery-button" type="button">VIEW ALL '+total+' PHOTOS →</button></div>';
  if(cfg.position==='append')anchor.appendChild(section);else anchor.parentNode.insertBefore(section,anchor.nextSibling);
  var grid=section.querySelector('.vehicle-photo-grid'),more=section.querySelector('.vehicle-gallery-button');
  function add(to){for(var i=grid.children.length;i<to;i++){var b=document.createElement('button');b.type='button';b.className='vehicle-photo';b.dataset.index=i;b.setAttribute('aria-label','Open '+cfg.alt+' '+(i+1));var img=document.createElement('img');img.loading='lazy';img.decoding='async';img.src=files[i];img.alt=cfg.alt+' '+(i+1);var label=document.createElement('span');label.className='vehicle-photo-label';label.textContent=cfg.label+' / '+String(i+1).padStart(2,'0');b.appendChild(img);b.appendChild(label);grid.appendChild(b)}}
  add(initial);if(initial>=total)more.parentElement.style.display='none';more.addEventListener('click',function(){add(total);more.parentElement.style.display='none'});
  var box=document.createElement('div');box.className='vehicle-lightbox';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Vehicle photo viewer');box.innerHTML='<div class="vehicle-lightbox-count"></div><button class="vehicle-lightbox-close" type="button" aria-label="Close gallery">×</button><button class="vehicle-lightbox-prev" type="button" aria-label="Previous photo">‹</button><img alt=""><button class="vehicle-lightbox-next" type="button" aria-label="Next photo">›</button><div class="vehicle-lightbox-caption"></div>';document.body.appendChild(box);
  var image=box.querySelector('img'),count=box.querySelector('.vehicle-lightbox-count'),caption=box.querySelector('.vehicle-lightbox-caption'),current=0,lastFocus=null;caption.textContent=cfg.caption;
  function show(n){current=(n+total)%total;image.src=files[current];image.alt=cfg.alt+' '+(current+1);count.textContent=String(current+1).padStart(2,'0')+' / '+String(total).padStart(2,'0');var next=new Image();next.src=files[(current+1)%total]}
  function open(n,el){lastFocus=el;show(n);box.classList.add('open');document.body.classList.add('gallery-lock');box.querySelector('.vehicle-lightbox-close').focus()}
  function close(){box.classList.remove('open');document.body.classList.remove('gallery-lock');image.removeAttribute('src');if(lastFocus)lastFocus.focus()}
  grid.addEventListener('click',function(e){var b=e.target.closest('.vehicle-photo');if(b)open(Number(b.dataset.index),b)});box.querySelector('.vehicle-lightbox-close').addEventListener('click',close);box.querySelector('.vehicle-lightbox-prev').addEventListener('click',function(){show(current-1)});box.querySelector('.vehicle-lightbox-next').addEventListener('click',function(){show(current+1)});box.addEventListener('click',function(e){if(e.target===box)close()});document.addEventListener('keydown',function(e){if(!box.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(current-1);if(e.key==='ArrowRight')show(current+1)});var sx=0;box.addEventListener('touchstart',function(e){sx=e.changedTouches[0].clientX},{passive:true});box.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)show(current+(dx<0?1:-1))},{passive:true})
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();