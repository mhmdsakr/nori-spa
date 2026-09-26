/* ===== NORI shared data & behavior ===== */
const NORI_DATA = {
  branches: [
    {id:'jubail', name:'الجبيل'},
    {id:'khobar', name:'الخبر'},
    {id:'dammam', name:'الدمام'}
  ],
  services: [
    {id:'relax', name:'مساج علاجي', icon:'fa-hand-holding-medical', price:240, duration:60, desc:'جلسة علاجية هادئة تعيد التوازن للجسم وتخفف من آثار التوتر اليومي.', img:'https://picsum.photos/seed/nori1/900/600'},
    {id:'sport', name:'مساج رياضي', icon:'fa-dumbbell', price:265, duration:75, desc:'مخصص لمن يمارس الرياضة بانتظام، يخفف الشد العضلي ويسرّع الاستشفاء.', img:'https://picsum.photos/seed/nori2/900/600'},
    {id:'hammam', name:'حمام مغربي', icon:'fa-water', price:200, duration:50, desc:'طقوس تنظيف تقليدية عريقة تمنح البشرة نضارة استثنائية.', img:'https://picsum.photos/seed/nori3/900/600'},
    {id:'sauna', name:'جاكوزي وساونا', icon:'fa-hot-tub-person', price:160, duration:40, desc:'لحظات من الدفء والهدوء لتصفية الذهن وتنشيط الجسد.', img:'https://picsum.photos/seed/nori4/900/600'},
    {id:'care', name:'عناية بالأظافر', icon:'fa-hand-sparkles', price:140, duration:45, desc:'عناية رجالية أنيقة تمنحك مظهراً مرتباً في كل التفاصيل.', img:'https://picsum.photos/seed/nori5/900/600'}
  ],
  offers: [
    {id:'off1', title:'توازن البداية', badge:'خصم 20%', desc:'باقة تجريبية لكل عميل جديد يزورنا لأول مرة.', img:'https://picsum.photos/seed/norioff1/700/500'},
    {id:'off2', title:'طقوس نهاية الأسبوع', badge:'عرض خاص', desc:'مساج علاجي وحمام مغربي في جلسة واحدة هادئة.', img:'https://picsum.photos/seed/norioff2/700/500'},
    {id:'off3', title:'عضوية نوري الذهبية', badge:'وفّر أكثر', desc:'زيارات شهرية غير محدودة بأسعار مخصصة للأعضاء.', img:'https://picsum.photos/seed/norioff3/700/500'}
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  if(loader){ setTimeout(()=>loader.classList.add('hide'), 2300); }

  const toast = document.getElementById('promoToast');
  if(toast){
    if(!sessionStorage.getItem('nori_promo_closed')){
      setTimeout(()=> toast.classList.add('show'), 3200);
    }
    const closeBtn = toast.querySelector('.close-t');
    if(closeBtn) closeBtn.addEventListener('click', ()=>{
      toast.classList.remove('show');
      sessionStorage.setItem('nori_promo_closed','1');
    });
  }

  const nav = document.querySelector('.navbar-nori');
  if(nav) window.addEventListener('scroll', ()=> nav.classList.toggle('scrolled', window.scrollY>30));

  const toggle = document.getElementById('navToggleN');
  const links = document.getElementById('navLinksN');
  if(toggle){
    toggle.addEventListener('click', ()=> links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>links.classList.remove('open')));
  }

  setupReveal(document.querySelectorAll('.reveal-n'));

  renderServicesGridN();
  renderOffersCarouselN();
});

/* Progressive-enhancement scroll reveal: elements are visible by default;
   only hidden (class "pre") once we know we can observe + reveal them,
   with a safety timeout so nothing ever stays invisible. */
function setupReveal(elements){
  if(!elements || !elements.length) return;
  if(!('IntersectionObserver' in window)){ return; } // no JS support -> stay visible, no-op
  elements.forEach(el => el.classList.add('pre'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.remove('pre'); e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:.12, rootMargin:'0px 0px -40px 0px'});
  elements.forEach(el=>io.observe(el));
  // safety net: force-reveal anything still hidden after 4s (covers edge cases)
  setTimeout(()=>{
    elements.forEach(el=>{ if(!el.classList.contains('in')){ el.classList.remove('pre'); el.classList.add('in'); } });
  }, 4000);
}

function renderServicesGridN(){
  document.querySelectorAll('[data-services-grid-n]').forEach(g=>{
    g.innerHTML = NORI_DATA.services.map(s=>`
      <div class="col-md-4 col-6 reveal-n">
        <div class="svc-card-n" onclick="openServicePanel('${s.id}')">
          <i class="fa-solid ${s.icon}"></i>
          <h5>${s.name}</h5>
          <p>${s.desc.slice(0,55)}...</p>
        </div>
      </div>`).join('');
    setupReveal(g.querySelectorAll('.reveal-n'));
  });
}

function renderOffersCarouselN(){
  const inner = document.getElementById('offerCarouselInner');
  const indic = document.getElementById('offerCarouselIndicators');
  if(!inner) return;
  inner.innerHTML = NORI_DATA.offers.map((o,i)=>`
    <div class="carousel-item ${i===0?'active':''}">
      <div class="offer-slide-n">
        <img src="${o.img}" alt="${o.title}">
        <div class="content">
          <span class="badge" style="background:var(--gold);color:#0e1713">${o.badge}</span>
          <h4 class="mt-2">${o.title}</h4>
          <p>${o.desc}</p>
          <button class="btn-outline-n" onclick="requireLoginThenOpenBookingN()">احجز هذا العرض</button>
        </div>
      </div>
    </div>`).join('');
  if(indic){
    indic.innerHTML = NORI_DATA.offers.map((o,i)=>`<button type="button" data-bs-target="#offerCarousel" data-bs-slide-to="${i}" class="${i===0?'active':''}"></button>`).join('');
  }
}

/* ===== Offcanvas service detail + inline accordion booking ===== */
let noriState = {service:null, branch:null};
function openServicePanel(id){
  const s = NORI_DATA.services.find(x=>x.id===id);
  if(!s) return;
  noriState.service = id;
  document.getElementById('ocTitle').textContent = s.name;
  document.getElementById('ocImg').src = s.img;
  document.getElementById('ocDesc').textContent = s.desc;
  document.getElementById('ocPrice').textContent = s.price + ' ريال — ' + s.duration + ' دقيقة';
  document.getElementById('ocBookingArea').innerHTML = '';
  document.getElementById('ocLoginArea').classList.toggle('d-none', isLoggedInN());
  document.getElementById('ocStartBtn').classList.toggle('d-none', !isLoggedInN());
  if(isLoggedInN()) buildInlineBooking();
  const ocEl = document.getElementById('serviceOffcanvas');
  if(typeof bootstrap !== 'undefined' && bootstrap.Offcanvas){
    (bootstrap.Offcanvas.getOrCreateInstance(ocEl)).show();
  } else {
    // fallback if the Bootstrap bundle failed to load from the CDN
    ocEl.classList.add('show');
    ocEl.style.visibility = 'visible';
  }
}
function isLoggedInN(){ return !!localStorage.getItem('nori_user'); }
function currentUserN(){ try{return JSON.parse(localStorage.getItem('nori_user'))}catch(e){return null} }
function doRegisterLoginN(e){
  e.preventDefault();
  const form = e.target;
  const user = { name: form.name.value, email: form.email.value, phone: form.phone.value, job: form.job.value };
  localStorage.setItem('nori_user', JSON.stringify(user));
  document.getElementById('ocLoginArea').classList.add('d-none');
  document.getElementById('ocStartBtn').classList.remove('d-none');
  buildInlineBooking();
  return false;
}
function buildInlineBooking(){
  const area = document.getElementById('ocBookingArea');
  area.innerHTML = `
    <div class="accordion accordion-n" id="bookAccordion">
      <div class="accordion-item">
        <h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accBranch">1. اختر الفرع</button></h2>
        <div id="accBranch" class="accordion-collapse collapse show" data-bs-parent="#bookAccordion">
          <div class="accordion-body d-flex gap-2 flex-wrap">
            ${NORI_DATA.branches.map(b=>`<div class="choice-n" data-branch-n="${b.id}" onclick="pickBranchN('${b.id}',this)">${b.name}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accDate">2. التاريخ والوقت</button></h2>
        <div id="accDate" class="accordion-collapse collapse" data-bs-parent="#bookAccordion">
          <div class="accordion-body">
            <input type="date" id="ocDate" class="form-control form-control-n mb-2">
            <select id="ocTime" class="form-select form-select-n">
              <option>10:00 ص</option><option>1:00 م</option><option>4:00 م</option><option>7:00 م</option>
            </select>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accConfirm">3. التأكيد</button></h2>
        <div id="accConfirm" class="accordion-collapse collapse" data-bs-parent="#bookAccordion">
          <div class="accordion-body">
            <p class="small" style="color:var(--text-dim)">بالضغط على تأكيد الحجز سيتم إرسال تفاصيل موعدك.</p>
            <button class="btn-outline-n w-100" onclick="confirmBookingN()">تأكيد الحجز</button>
          </div>
        </div>
      </div>
    </div>
    <div id="ocSuccess" class="text-center mt-3 d-none">
      <i class="fa-solid fa-circle-check" style="color:var(--gold-l);font-size:2.2rem"></i>
      <p class="mt-2 mb-0">تم تأكيد حجزك بنجاح، بانتظارك.</p>
    </div>`;
}
function pickBranchN(id, el){
  document.querySelectorAll('[data-branch-n]').forEach(x=>x.classList.remove('selected'));
  el.classList.add('selected');
  noriState.branch = id;
}
function confirmBookingN(){
  document.getElementById('bookAccordion').classList.add('d-none');
  document.getElementById('ocSuccess').classList.remove('d-none');
}
function requireLoginThenOpenBookingN(){
  if(!noriState.service) noriState.service = NORI_DATA.services[0].id;
  openServicePanel(noriState.service);
}
