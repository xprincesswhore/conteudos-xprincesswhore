document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURAÇÃO ---
  const CONFIG = {
    paymentLink: "https://go.invictuspay.app.br/uiu36mqyaf",
    slideDuration: 5000,
    assetsPath: 'assets/',
    // Adicione seus arquivos aqui
    media: [
      "1.mp4",
      "2.mp4", 
      "3.mp4",
      "4.mp4"
    ]
  };

  // --- ELEMENTOS ---
  const els = {
    carousel: document.getElementById('carouselRoot'),
    slidesContainer: document.getElementById('slides'),
    indicators: document.getElementById('indicators'),
    btnNext: document.getElementById('next'),
    btnPrev: document.getElementById('prev'),
    btnPreview: document.getElementById('previewBtn'),
    
    // Lightbox
    lightbox: document.getElementById('previewBack'),
    lightboxClose: document.getElementById('closePreview'),
    lightboxArea: document.getElementById('previewArea'),
    
    // Compra
    btnBuyDesktop: document.getElementById('buyBtnDesktop'),
    btnBuyMobile: document.getElementById('buyBtnMobile')
  };

  // --- ESTADO ---
  let state = {
    currentIndex: 0,
    timer: null,
    isPlaying: true,
    slides: [] // Array de objetos { element, type, src }
  };

  // --- CORE: SETUP CAROUSEL ---
  function init() {
    buildSlides();
    startTimer();
    bindEvents();
  }

  function buildSlides() {
    els.slidesContainer.innerHTML = '';
    els.indicators.innerHTML = '';

    CONFIG.media.forEach((file, index) => {
      const isVideo = file.toLowerCase().endsWith('.mp4');
      const src = file.startsWith('http') ? file : `${CONFIG.assetsPath}${file}`;

      // 1. Criar Slide
      const slideEl = document.createElement('div');
      slideEl.className = 'slide';
      
      let content = '';
      if (isVideo) {
        // Vídeo no carrossel: Muted, Loop, Playsinline (importante p/ iOS)
        content = `<video muted playsinline loop preload="metadata" class="carousel-media">
                     <source src="${src}" type="video/mp4">
                   </video>`;
      } else {
        content = `<img src="${src}" class="carousel-media" alt="Slide ${index}">`;
      }
      slideEl.innerHTML = content;
      els.slidesContainer.appendChild(slideEl);

      // 2. Criar Dot Indicador
      const dot = document.createElement('div');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(index));
      els.indicators.appendChild(dot);

      // 3. Salvar referência no Estado
      state.slides.push({
        element: slideEl,
        type: isVideo ? 'video' : 'image',
        src: src,
        videoEl: isVideo ? slideEl.querySelector('video') : null
      });
    });
  }

  // --- NAVEGAÇÃO ---
  function goToSlide(index) {
    const total = state.slides.length;
    // Lógica circular
    state.currentIndex = ((index % total) + total) % total;

    // Atualiza container (slide)
    els.slidesContainer.style.transform = `translateX(-${state.currentIndex * 100}%)`;

    // Atualiza Dots
    Array.from(els.indicators.children).forEach((dot, i) => {
      dot.classList.toggle('active', i === state.currentIndex);
    });

    // Gestão de Vídeos (Play no ativo, Pause nos outros para economizar recurso)
    state.slides.forEach((s, i) => {
      if (s.videoEl) {
        if (i === state.currentIndex) {
          s.videoEl.currentTime = 0;
          s.videoEl.play().catch(() => {}); // Autoplay pode falhar, sem problemas
        } else {
          s.videoEl.pause();
        }
      }
    });

    resetTimer();
  }

  function next() { goToSlide(state.currentIndex + 1); }
  function prev() { goToSlide(state.currentIndex - 1); }

  // --- TIMER AUTOMÁTICO ---
  function startTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(next, CONFIG.slideDuration);
  }

  function resetTimer() {
    clearInterval(state.timer);
    if (state.isPlaying) startTimer();
  }

  // --- PREVIEW / LIGHTBOX ---
  function openPreview() {
    // Pausa o carrossel
    state.isPlaying = false;
    clearInterval(state.timer);

    const currentSlide = state.slides[state.currentIndex];
    els.lightboxArea.innerHTML = ''; // Limpa anterior

    if (currentSlide.type === 'video') {
      // Cria vídeo com controles e SOM ATIVADO
      const vid = document.createElement('video');
      vid.src = currentSlide.src;
      vid.controls = true;
      vid.autoplay = true;
      vid.style.maxHeight = '100%';
      els.lightboxArea.appendChild(vid);
    } else {
      const img = document.createElement('img');
      img.src = currentSlide.src;
      els.lightboxArea.appendChild(img);
    }

    els.lightbox.setAttribute('aria-hidden', 'false');
  }

  function closePreview() {
    els.lightbox.setAttribute('aria-hidden', 'true');
    els.lightboxArea.innerHTML = ''; // Destrói o vídeo para parar o som imediatamente
    
    // Retoma carrossel
    state.isPlaying = true;
    startTimer();
    
    // Garante que o vídeo do slide de fundo (sem som) volte a tocar
    const currentSlide = state.slides[state.currentIndex];
    if(currentSlide.videoEl) currentSlide.videoEl.play().catch(()=>{});
  }

  // --- COMPRA ---
  function goToCheckout() {
    // Feedback visual rápido antes de abrir
    const btns = [els.btnBuyDesktop, els.btnBuyMobile];
    btns.forEach(b => { 
      if(b) b.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> INDO...'; 
    });
    
    setTimeout(() => {
      window.open(CONFIG.paymentLink, '_blank');
      // Reseta botões
      if(els.btnBuyDesktop) els.btnBuyDesktop.innerHTML = '<span>QUERO ACESSO AGORA</span><i class="fa-solid fa-arrow-right"></i>';
      if(els.btnBuyMobile) els.btnBuyMobile.innerHTML = 'COMPRAR AGORA';
    }, 500);
  }

  // --- EVENTOS ---
  function bindEvents() {
    els.btnNext.addEventListener('click', () => { next(); });
    els.btnPrev.addEventListener('click', () => { prev(); });
    
    // Swipe básico para mobile touch
    let touchStartX = 0;
    els.carousel.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
    els.carousel.addEventListener('touchend', e => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) next();
      if (touchEndX - touchStartX > 50) prev();
    });

    // Preview
    els.btnPreview.addEventListener('click', openPreview);
    els.lightboxClose.addEventListener('click', closePreview);
    els.lightbox.addEventListener('click', (e) => {
      if(e.target === els.lightbox) closePreview();
    });

    // Checkout
    if(els.btnBuyDesktop) els.btnBuyDesktop.addEventListener('click', goToCheckout);
    if(els.btnBuyMobile) els.btnBuyMobile.addEventListener('click', goToCheckout);
  }

  // Start
  init();
});
