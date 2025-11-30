document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURAÇÃO GLOBAL ---
  const CONFIG = {
    paymentLink: "https://go.invictuspay.app.br/uiu36mqyaf",
    slideDuration: 4000,
    assetsPath: 'assets/',

    // SEUS ARQUIVOS (Mantenha sua lista gerada pelo site aqui)
    gifs: [
      "1.mp4", "2.mp4", "3.mp4", "4.mp4", "5.mp4"
    ],
    images: [
      "foto1.jpg", "foto2.jpg", "foto3.jpg", "foto4.jpg", "foto5.jpg",
      "foto6.jpg", "foto7.jpg", "foto8.jpg", "foto9.jpeg", "foto10.jpg",
      "foto11.jpg", "foto12.jpg", "foto13.jpg", "foto14.jpg", "foto15.jpg",
      "foto16.jpg", "foto17.jpg", "foto18.jpg", "foto19.jpg", "foto20.jpg"
    ],
    // Placeholders não são mais necessários para o Grid (Otimização)
    gridPlaceholders: [] 
  };

  // --- COMPONENT: CAROUSEL ---
  class CarouselComponent {
    constructor(wrapperId, mediaList) {
      this.wrapper = document.getElementById(wrapperId);
      if (!this.wrapper) return;

      this.mediaList = mediaList;
      this.currentIndex = 0;
      this.timer = null;
      this.isPlaying = true;
      this.slidesRef = [];

      this.els = {
        container: this.wrapper.querySelector('.slides'),
        indicators: this.wrapper.querySelector('.indicators'),
        btnNext: this.wrapper.querySelector('.next-btn'),
        btnPrev: this.wrapper.querySelector('.prev-btn'),
        btnPreview: this.wrapper.querySelector('.preview-trigger'),
        root: this.wrapper.querySelector('.carousel')
      };

      this.init();
    }

    init() {
      this.buildSlides();
      this.bindEvents();
      this.startTimer();
    }

    buildSlides() {
      this.els.container.innerHTML = '';
      this.els.indicators.innerHTML = '';

      this.mediaList.forEach((file, index) => {
        const src = file.startsWith('http') ? file : `${CONFIG.assetsPath}${file}`;
        const isVideo = file.toLowerCase().endsWith('.mp4');
        
        const slideEl = document.createElement('div');
        slideEl.className = 'slide';
        
        // OTIMIZAÇÃO: loading="lazy" e preload="none"
        if (isVideo) {
          slideEl.innerHTML = `
            <video class="carousel-media" muted loop playsinline preload="metadata">
              <source src="${src}" type="video/mp4">
            </video>`;
        } else {
          // decoding="async" ajuda a não travar a rolagem
          slideEl.innerHTML = `<img src="${src}" class="carousel-media" loading="lazy" decoding="async" alt="Slide ${index}">`;
        }
        
        this.els.container.appendChild(slideEl);

        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => this.goToSlide(index));
        this.els.indicators.appendChild(dot);

        this.slidesRef.push({ 
          src, 
          type: isVideo ? 'video' : 'image',
          videoEl: isVideo ? slideEl.querySelector('video') : null
        });
      });
      
      this.handleVideoPlayback();
    }

    goToSlide(index) {
      const total = this.slidesRef.length;
      this.currentIndex = ((index % total) + total) % total;

      this.els.container.style.transform = `translateX(-${this.currentIndex * 100}%)`;

      Array.from(this.els.indicators.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === this.currentIndex);
      });

      this.handleVideoPlayback();
      this.resetTimer();
    }

    handleVideoPlayback() {
      this.slidesRef.forEach((s, i) => {
        if (s.videoEl) {
          if (i === this.currentIndex) {
            // Tenta tocar apenas se estiver visível
            const playPromise = s.videoEl.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {});
            }
          } else {
            s.videoEl.pause();
            s.videoEl.currentTime = 0; // Libera buffer
          }
        }
      });
    }

    next() { this.goToSlide(this.currentIndex + 1); }
    prev() { this.goToSlide(this.currentIndex - 1); }

    startTimer() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => this.next(), CONFIG.slideDuration);
    }

    resetTimer() {
      clearInterval(this.timer);
      if (this.isPlaying) this.startTimer();
    }

    bindEvents() {
      this.els.btnNext.addEventListener('click', () => this.next());
      this.els.btnPrev.addEventListener('click', () => this.prev());

      this.els.btnPreview.addEventListener('click', () => {
        const currentItem = this.slidesRef[this.currentIndex];
        App.openLightbox(currentItem.src, currentItem.type);
        this.pause();
      });

      let touchStartX = 0;
      this.els.root.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive: true});
      this.els.root.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) this.next();
        if (touchEndX - touchStartX > 50) this.prev();
      }, {passive: true});
    }
    
    pause() {
        this.isPlaying = false;
        clearInterval(this.timer);
        const current = this.slidesRef[this.currentIndex];
        if(current && current.videoEl) current.videoEl.pause();
    }
    
    resume() {
      this.isPlaying = true;
      this.startTimer();
      this.handleVideoPlayback();
    }
  }

  // --- CONTROLLER PRINCIPAL ---
  const App = {
    carousels: [],
    
    init() {
      this.carousels.push(new CarouselComponent('carousel-gifs-wrapper', CONFIG.gifs));
      this.carousels.push(new CarouselComponent('carousel-imgs-wrapper', CONFIG.images));

      document.querySelectorAll('.action-buy').forEach(btn => {
        btn.addEventListener('click', this.goToCheckout);
      });

      document.getElementById('closePreview').addEventListener('click', this.closeLightbox);
      document.getElementById('previewModal').addEventListener('click', (e) => {
        if(e.target.id === 'previewModal') this.closeLightbox();
      });

      this.setupGallery();
    },

    goToCheckout() {
      const btns = document.querySelectorAll('.action-buy');
      const originalTexts = [];
      btns.forEach((b, i) => {
        originalTexts[i] = b.innerHTML;
        b.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ...';
        b.disabled = true;
      });
      setTimeout(() => {
        window.open(CONFIG.paymentLink, '_blank');
        btns.forEach((b, i) => {
          b.innerHTML = originalTexts[i];
          b.disabled = false;
        });
      }, 500);
    },

    openLightbox(src, type) {
      const modal = document.getElementById('previewModal');
      const area = document.getElementById('previewArea');
      area.innerHTML = '';

      if (type === 'video') {
        const vid = document.createElement('video');
        vid.src = src;
        vid.controls = true;
        vid.autoplay = true;
        vid.style.maxHeight = '100%';
        vid.style.maxWidth = '100%';
        area.appendChild(vid);
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.style.maxHeight = '100%';
        img.style.maxWidth = '100%';
        area.appendChild(img);
      }
      modal.setAttribute('aria-hidden', 'false');
      App.carousels.forEach(c => c.pause());
    },

    closeLightbox() {
      const modal = document.getElementById('previewModal');
      modal.setAttribute('aria-hidden', 'true');
      document.getElementById('previewArea').innerHTML = '';
      App.carousels.forEach(c => c.resume());
    },

    // --- GALERIA LEVE (SEM IMAGENS REAIS) ---
    setupGallery() {
      const btns = document.querySelectorAll('.see-more-btn');
      const modal = document.getElementById('galleryModal');
      const grid = document.getElementById('lockedGrid');
      const closeBtn = document.getElementById('closeGallery');

      // OTIMIZAÇÃO CRÍTICA: Não carrega imagens reais nos 100 itens.
      // Usa gradientes CSS para simular conteúdo. Zero consumo de RAM.
      const fragment = document.createDocumentFragment();
      
      // Cores para simular diversidade de conteúdo
      const colors = ['#1a1a1a', '#222', '#2a2a2a', '#111', '#1f1f1f'];
      
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        div.className = 'blur-item';
        // Randomiza levemente a cor de fundo
        const color = colors[Math.floor(Math.random() * colors.length)];
        div.style.background = color;
        // Adiciona um gradiente sutil para parecer uma foto borrada
        div.style.backgroundImage = `linear-gradient(45deg, ${color}, rgba(139, 92, 246, 0.1))`;
        
        fragment.appendChild(div);
      }
      grid.appendChild(fragment);

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          modal.setAttribute('aria-hidden', 'false');
        });
      });

      const close = () => modal.setAttribute('aria-hidden', 'true');
      closeBtn.addEventListener('click', close);
      modal.addEventListener('click', (e) => {
        if(e.target === modal) close();
      });
    }
  };

  App.init();
});
