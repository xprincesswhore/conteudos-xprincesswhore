document.addEventListener("DOMContentLoaded", async () => {
  const carousel = document.querySelector(".carousel");
  const btnPagamento = document.querySelectorAll(".btn-pagamento");
  const PAGAMENTO_LINK = "https://go.invictuspay.app.br/uiu36mqyaf";

  // Aplica o link em todos os botões de pagamento
  btnPagamento.forEach(btn => btn.href = PAGAMENTO_LINK);

  // Busca automaticamente as imagens da pasta /assets/
  async function carregarImagens() {
    try {
      const response = await fetch("assets/");
      const html = await response.text();
      const matches = [...html.matchAll(/href="([^"]+\.(jpg|jpeg|png|gif|webp))"/gi)];
      return matches.map(m => "assets/" + m[1]);
    } catch (err) {
      console.error("Erro ao buscar imagens:", err);
      return [];
    }
  }

  // Inicializa o carrossel
  async function iniciarCarrossel() {
    const imagens = await carregarImagens();

    if (imagens.length === 0) {
      carousel.innerHTML = "<p style='color:white;text-align:center;'>Nenhuma imagem encontrada.</p>";
      return;
    }

    let index = 0;
    const imgElement = document.createElement("img");
    imgElement.src = imagens[index];
    imgElement.classList.add("fade-in");
    carousel.appendChild(imgElement);

    setInterval(() => {
      index = (index + 1) % imagens.length;
      const novaImg = document.createElement("img");
      novaImg.src = imagens[index];
      novaImg.classList.add("fade-in");

      carousel.innerHTML = "";
      carousel.appendChild(novaImg);
    }, 1500);
  }

  iniciarCarrossel();
});  function showNextSlide() {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }

  // Troca a cada 1.5s
  setInterval(showNextSlide, 2500);
}

// Atualiza todos os botões de pagamento automaticamente
document.querySelectorAll("a, button").forEach(el => {
  if (
    el.textContent.toLowerCase().includes("comprar") ||
    el.textContent.toLowerCase().includes("pagamento") ||
    el.classList.contains("pagamento-btn")
  ) {
    el.href = linkPagamento;
    el.target = "_blank";
  }
});  if (pagamentoBtn) {
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
