document.addEventListener('DOMContentLoaded',function(){
  var navLinks=document.querySelector('nav .links');
  if(navLinks&&!navLinks.querySelector('a[href="cars-for-sale.html"]')){
    var sale=document.createElement('a');
    sale.href='cars-for-sale.html';
    sale.textContent='CARS FOR SALE';
    var shop=navLinks.querySelector('a[href="shop.html"]');
    if(shop)navLinks.insertBefore(sale,shop);else navLinks.appendChild(sale);
  }

  var footerExplore=document.querySelector('footer .footer-col:nth-child(2)');
  if(footerExplore&&!footerExplore.querySelector('a[href="cars-for-sale.html"]')){
    var footerSale=document.createElement('a');
    footerSale.href='cars-for-sale.html';
    footerSale.textContent='Cars For Sale';
    var footerShop=footerExplore.querySelector('a[href="shop.html"]');
    if(footerShop)footerExplore.insertBefore(footerSale,footerShop);else footerExplore.appendChild(footerSale);
  }

  if(document.body.classList.contains('sale-home-ready'))return;
  var manifesto=document.querySelector('.manifesto');
  if(!manifesto)return;
  document.body.classList.add('sale-home-ready');

  var style=document.createElement('style');
  style.textContent='.sale-home{padding:96px 5vw;background:#151614;border-top:1px solid #292a27;border-bottom:1px solid #292a27}.sale-home-inner{max-width:1580px;margin:auto;display:grid;grid-template-columns:1.08fr .92fr;gap:9vw;align-items:center}.sale-home .sale-rule{width:42px;height:2px;background:#c92731;margin-bottom:22px}.sale-home .sale-kicker{font-size:10px;letter-spacing:3px;color:#aaa69e;text-transform:uppercase}.sale-home h2{font-size:clamp(50px,5.6vw,82px);line-height:.9;letter-spacing:-4px;margin:16px 0 24px}.sale-home h2 span{font-weight:300;color:#c9c2b6}.sale-home p{max-width:620px;color:#99958d;font-size:15px;line-height:1.8;margin:0}.sale-home-card{border:1px solid #343531;background:#111210;padding:38px 40px;min-height:245px;display:flex;flex-direction:column;justify-content:space-between}.sale-home-card small{font-size:9px;letter-spacing:2.3px;color:#c92731;font-weight:800}.sale-home-card h3{font-size:30px;letter-spacing:-1px;margin:13px 0}.sale-home-card p{font-size:13px;line-height:1.7}.sale-home .sale-btn{display:inline-block;margin-top:30px;padding:15px 20px;background:#f4f1ea;color:#111;font-size:10px;font-weight:800;letter-spacing:1.5px}.sale-home-card .sale-link{font-size:10px;letter-spacing:1.5px;font-weight:800;margin-top:28px}@media(max-width:900px){.sale-home-inner{grid-template-columns:1fr;gap:45px}}@media(max-width:760px){.sale-home{padding:70px 6vw}.sale-home h2{font-size:clamp(45px,13vw,62px);letter-spacing:-3px}.sale-home-card{padding:30px 26px;min-height:220px}}';
  document.head.appendChild(style);

  var section=document.createElement('section');
  section.className='sale-home';
  section.innerHTML='<div class="sale-home-inner"><div><div class="sale-rule"></div><div class="sale-kicker">LAKACHE AUTO / CARS FOR SALE</div><h2>FROM THE BUILD<br><span>TO THE NEXT OWNER.</span></h2><p>Select Lakache Auto projects are now available for purchase. Each listing keeps the vehicle connected to its documented story, repair history and current condition.</p><a class="sale-btn" href="cars-for-sale.html">VIEW CARS FOR SALE →</a></div><div class="sale-home-card"><div><small>CURRENT INVENTORY / 02 VEHICLES</small><h3>DOCUMENTED CARS, AVAILABLE NOW.</h3><p>Explore the 2024 Volkswagen GTI Autobahn and 2016 BMW 550i M Sport. Final asking prices and sale-day details will be published as they are verified.</p></div><a class="sale-link" href="cars-for-sale.html">VIEW CURRENT INVENTORY →</a></div></div>';
  manifesto.parentNode.insertBefore(section,manifesto);
});