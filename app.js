// Config
const ASSETS_JSON = 'assets/assets.json';
const SLIDE_DURATION = 1500; // ms (1.5s as requested)
const TRANSITION_MS = 600; // slides container transition

// DOM refs
const slidesEl = document.getElementById('slides');
const indicatorsEl = document.getElementById('indicators');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const carouselRoot = document.getElementById('carousel');

let slides = [];
let dots = [];
let idx = 0;
let timer = null;
let playing = true;

// load header avatar background image (use an existing asset or fallback gradient)
(function setHeaderAvatar(){
  const headerAvatar = document.getElementById('headerAvatar');
  // default image path (you can replace with any file in assets/)
  headerAvatar.style.background = 'url(\"assets/dreamina-2025-10-29-8921-I want you to remove the background and ....jpg\") center/cover no-repeat';
  headerAvatar.style.backgroundSize = 'cover';
})();

// fetch assets manifest, build slides
fetch(ASSETS_JSON)
  .then(r => r.json())
  .then(data => buildSlides(data.files || []))
  .catch(err => {
    console.error('Erro ao carregar assets.json', err);
    // fallback: build 3 placeholders
    buildSlides([]);
  });

function buildSlides(files){
  slidesEl.innerHTML = '';
  indicatorsEl.innerHTML = '';

  const effective = files.length ? files : [
    // fallback placeholders (should be replaced)
    'https://picsum.photos/1000/600?random=101',
    'https://picsum.photos/1000/600?random=102',
    'https://picsum.photos/1000/600?random=103'
  ];

  effective.forEach((file, i) => {
    const isVideo = /\.(mp4|webm|mov)$/i.test(file);
    const slide = document.createElement('div');
    slide.className = 'slide' + (i === 0 ? ' active' : '');
    slide.dataset.type = isVideo ? 'video' : 'image';

    if(isVideo){
      slide.innerHTML = `<video muted playsinline preload="metadata" loop>
        <source src="assets/${file}" type="video/mp4">
        Seu navegador não suporta vídeo.
      </video>
      <div class="caption">Vídeo ${i+1}</div>`;
    } else {
      // if URL (external) provided, use directly; else assume assets/
      const src = file.startsWith('http') ? file : `assets/${file}`;
      slide.innerHTML = `<img src="${src}" alt="Slide ${i+1}">
      <div class="caption">Imagem ${i+1}</div>`;
    }

    slidesEl.appendChild(slide);

    // indicator
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    indicatorsEl.appendChild(dot);
  });

  // update node lists
  slides = Array.from(document.querySelectorAll('.slide'));
  dots = Array.from(document.querySelectorAll('.dot'));

  // set CSS slide-duration variable for ken effect
  slidesEl.style.setProperty('--slide-duration', (SLIDE_DURATION/1000).toFixed(2) + 's');

  // initialize carousel behavior
  initCarousel();
}

// carousel behavior
function initCarousel(){
  if(timer) clearInterval(timer);
  idx = 0;
  showSlide(idx);
  timer = setInterval(() => { goTo(idx + 1); }, SLIDE_DURATION);

  // controls
  nextBtn.onclick = () => { goTo(idx + 1); resetTimer(); };
  prevBtn.onclick = () => { goTo(idx - 1); resetTimer(); };
  dots.forEach(d => d.onclick = () => { goTo(+d.dataset.index); resetTimer(); });

  // pause on hover
  carouselRoot.addEventListener('mouseenter', () => { pause(); });
  carouselRoot.addEventListener('mouseleave', () => { resume(); });

  // keyboard
  document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight'){ goTo(idx+1); resetTimer(); }
    if(e.key === 'ArrowLeft'){ goTo(idx-1); resetTimer(); }
  });
}

function showSlide(i){
  // normalize
  const n = slides.length;
  if(n === 0) return;
  idx = ((i % n) + n) % n;

  // transform container
  slidesEl.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.2,.9,.2,1)`;
  slidesEl.style.transform = `translateX(-${idx * 100}%)`;

  // active classes & media control
  slides.forEach((s, si) => {
    s.classList.toggle('active', si === idx);
    const v = s.querySelector('video');
    if(v){
      try { v.pause(); v.currentTime = 0; } catch(e){}
    }
  });

  const current = slides[idx];
  if(!current) return;
  const currentVideo = current.querySelector('video');
  if(currentVideo){
    // play muted preview for videos
    currentVideo.muted = true;
    currentVideo.play().catch(()=>{ /* autoplay blocked fallback */ });
  }
  // update dots
  dots.forEach(d => d.classList.remove('active'));
  if(dots[idx]) dots[idx].classList.add('active');
}

function goTo(i){
  showSlide(i);
}

function resetTimer(){
  if(timer) clearInterval(timer);
  timer = setInterval(() => { goTo(idx + 1); }, SLIDE_DURATION);
}

function pause(){ playing = false; if(timer) clearInterval(timer); }
function resume(){ if(!playing){ playing = true; resetTimer(); } else { resetTimer(); } }

// Modal & preview
const buyBtn = document.getElementById('buyBtn');
const modalBack = document.getElementById('modalBack');
const cancelModal = document.getElementById('cancelModal');
const confirmPay = document.getElementById('confirmPay');
const previewBtn = document.getElementById('previewBtn');
const previewBack = document.getElementById('previewBack');
const closePreview = document.getElementById('closePreview');
const previewArea = document.getElementById('previewArea');
const PAYMENT_LINK = '#'; // replace with real link

if(buyBtn) buyBtn.addEventListener('click', ()=> {
  modalBack.style.display = 'flex';
  modalBack.setAttribute('aria-hidden','false');
});
if(cancelModal) cancelModal.addEventListener('click', ()=> {
  modalBack.style.display = 'none';
  modalBack.setAttribute('aria-hidden','true');
});
if(confirmPay) confirmPay.addEventListener('click', ()=> {
  modalBack.style.display = 'none';
  modalBack.setAttribute('aria-hidden','true');
  if(PAYMENT_LINK === '#' || !PAYMENT_LINK){ alert('Página de pagamento não configurada. Substitua PAYMENT_LINK no código.'); return; }
  window.location.href = PAYMENT_LINK;
});
if(modalBack) modalBack.addEventListener('click', (e)=>{ if(e.target === modalBack){ modalBack.style.display='none'; modalBack.setAttribute('aria-hidden','true'); } });

if(previewBtn) previewBtn.addEventListener('click', ()=>{
  const active = document.querySelector('.slide.active');
  if(!active) return;
  previewArea.innerHTML = '';
  if(active.dataset.type === 'video'){
    const src = active.querySelector('video source')?.src;
    if(src){
      const vid = document.createElement('video');
      vid.controls = true;
      vid.autoplay = true;
      vid.muted = false;
      vid.style.width = '100%';
      vid.style.height = '100%';
      const s = document.createElement('source');
      s.src = src;
      s.type = 'video/mp4';
      vid.appendChild(s);
      previewArea.appendChild(vid);
      try{ vid.play(); }catch(e){}
    }
  } else {
    const img = active.querySelector('img');
    if(img){
      const clone = document.createElement('img');
      clone.src = img.src;
      clone.style.width = '100%';
      clone.style.height = '100%';
      clone.style.objectFit = 'cover';
      previewArea.appendChild(clone);
    }
  }
  previewBack.style.display = 'flex';
  previewBack.setAttribute('aria-hidden','false');
});
if(closePreview) closePreview.addEventListener('click', ()=>{ previewBack.style.display='none'; previewBack.setAttribute('aria-hidden','true'); previewArea.innerHTML = ''; });
if(previewBack) previewBack.addEventListener('click', (e)=>{ if(e.target === previewBack){ previewBack.style.display='none'; previewBack.setAttribute('aria-hidden','true'); previewArea.innerHTML = ''; } });

// ensure dots keyboard accessible
document.addEventListener('DOMContentLoaded', ()=> {
  document.querySelectorAll('.dot').forEach((d,i)=> d.dataset.index = i);
});
