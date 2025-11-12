document.addEventListener('DOMContentLoaded', () => {
  const carouselContainer = document.querySelector('.carousel-container');
  const items = document.querySelectorAll('.carousel-item');
  const totalItems = items.length;
  let currentIndex = 0;

  // Função para alternar os slides com fade e zoom suave
  function showNextItem() {
    const currentItem = items[currentIndex];
    currentItem.classList.remove('active');
    currentItem.style.opacity = '0';
    currentItem.style.transform = 'scale(1)';

    currentIndex = (currentIndex + 1) % totalItems;

    const nextItem = items[currentIndex];
    nextItem.classList.add('active');
    nextItem.style.opacity = '1';
    nextItem.style.transform = 'scale(1.05)';
  }

  // Tempo de transição entre slides (4 segundos)
  setInterval(showNextItem, 4000);

  // Efeito de brilho e suavidade na transição
  items.forEach(item => {
    item.style.transition = 'opacity 1.5s ease, transform 1.5s ease';
    if (item.tagName === 'IMG' || item.tagName === 'VIDEO') {
      item.style.objectFit = 'cover';
      item.style.width = '100%';
      item.style.height = '100%';
    }
  });

  // Animação no botão de pagamento
  const pagamentoBtn = document.querySelector('.pagamento-btn');
  if (pagamentoBtn) {
    pagamentoBtn.addEventListener('mouseenter', () => {
      pagamentoBtn.style.transition = 'all 0.6s ease';
      pagamentoBtn.style.transform = 'scale(1.08)';
      pagamentoBtn.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
    });

    pagamentoBtn.addEventListener('mouseleave', () => {
      pagamentoBtn.style.transform = 'scale(1)';
      pagamentoBtn.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
    });

    pagamentoBtn.addEventListener('click', () => {
      window.location.href = 'https://go.invictuspay.app.br/uiu36mqyaf';
    });
  }

  // Fade suave nos textos e seções
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 1s ease';
    setTimeout(() => {
      el.style.opacity = '1';
    }, 500 + index * 300);
  });
});  pagamentoBtn.addEventListener('mouseleave', () => {
    pagamentoBtn.style.transform = 'scale(1)';
    pagamentoBtn.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
  });

  // Redirecionar para pagamento
  pagamentoBtn.addEventListener('click', () => {
    window.location.href = 'https://go.invictuspay.app.br/uiu36mqyaf';
  });

  // Animações suaves de entrada dos elementos
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, index * 200);
  });
});      slide.innerHTML = `<video muted playsinline preload="metadata" loop>
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
