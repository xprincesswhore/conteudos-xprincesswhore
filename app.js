document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURAÇÃO GLOBAL ---
  const CONFIG = {
    paymentLink: "https://go.invictuspay.app.br/uiu36mqyaf",
    slideDuration: 4000,
    assetsPath: 'assets/',

    // --- ARQUIVOS (Seus arquivos MP4 e JPG) ---
    gifs: [
      "1.mp4",
      "2.mp4",
      "3.mp4",
      "4.mp4",
      "5.mp4"
    ],

    images: [
      "foto1.jpg", "foto2.jpg", "foto3.jpg", "foto4.jpg", "foto5.jpg",
      "foto6.jpg", "foto7.jpg", "foto8.jpg", "foto9.jpeg", "foto10.jpg",
      "foto11.jpg", "foto12.jpg", "foto13.jpg", "foto14.jpg", "foto15.jpg",
      "foto16.jpg", "foto17.jpg", "foto18.jpg", "foto19.jpg", "foto20.jpg"
    ],

    // Placeholders para o fundo borrado da galeria
    gridPlaceholders: ["1.mp4", "foto1.jpg"]
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

      // Elementos internos
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
        // Lógica de Detecção de Vídeo
        const isVideo = file.toLowerCase().endsWith('.mp4');

        // 1. Slide
        const slideEl = document.createElement('div');
        slideEl.className = 'slide';
        
        // --- CORREÇÃO AQUI: VÍDEO vs IMAGEM ---
        if (isVideo) {
          // Video: Muted para permitir autoplay no mobile
          slideEl.innerHTML = `
            <video class="carousel-media" muted loop playsinline preload="metadata">
              <source src="${src}" type="video/mp4">
            </video>`;
        } else {
          // Imagem normal
          slideEl.innerHTML = `<img src="${src}" class="carousel-media" alt="Slide ${index}">`;
        }
        
        this.els.container.appendChild(slideEl);

        // 2. Dot
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => this.goToSlide(index));
        this.els.indicators.appendChild(dot);

        // 3. Salvar Referência (importante para dar Play/Pause depois)
        this.slidesRef.push({ 
          src, 
          type: isVideo ? 'video' : 'image',
          videoEl: isVideo ? slideEl.querySelector('video') : null
        });
      });
      
      // Tentar dar play no primeiro se for vídeo
      this.handleVideoPlayback();
    }

    goToSlide(index) {
      const total = this.slidesRef.length;
      this.currentIndex = ((index % total) + total) % total;

      // Move Container
      this.els.container.style.transform = `translateX(-${this.currentIndex * 100}%)`;

      // Atualiza Dots
      Array.from(this.els.indicators.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === this.currentIndex);
      });

      this.handleVideoPlayback();
      this.resetTimer();
    }

    // Gerenciador de Play/Pause (Economia de Bateria/Dados)
    handleVideoPlayback() {
      this.slidesRef.forEach((s, i) => {
        if (s.videoEl) {
          if (i === this.currentIndex) {
            s.videoEl.currentTime = 0;
            s.videoEl.play().catch(() => {}); // Autoplay seguro
          } else {
            s.videoEl.pause();
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

      // Preview (Expandir)
      this.els.btnPreview.addEventListener('click', () => {
        const currentItem = this.slidesRef[this.currentIndex];
        App.openLightbox(currentItem.src, currentItem.type);
        this.isPlaying = false;
        clearInterval(this.timer);
      });

      // Swipe
      let touchStartX = 0;
      this.els.root.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
      this.els.root.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) this.next();
        if (touchEndX - touchStartX > 50) this.prev();
      });
    }
    
    resume() {
      this.isPlaying = true;
      this.startTimer();
      // Retomar vídeo se for o slide atual
      this.handleVideoPlayback();
    }
    
    pause() {
        this.isPlaying = false;
        clearInterval(this.timer);
        // Pausar vídeo atual para não ficar tocando no fundo
        const current = this.slidesRef[this.currentIndex];
        if(current && current.videoEl) current.videoEl.pause();
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
        b.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> PROCESSANDO...';
        b.disabled = true;
      });
      setTimeout(() => {
        window.open(CONFIG.paymentLink, '_blank');
        btns.forEach((b, i) => {
          b.innerHTML = originalTexts[i];
          b.disabled = false;
        });
      }, 800);
    },

    // --- LIGHTBOX (Modal Expandido) CORRIGIDO ---
    openLightbox(src, type) {
      const modal = document.getElementById('previewModal');
      const area = document.getElementById('previewArea');
      
      // Limpa conteúdo anterior
      area.innerHTML = '';

      if (type === 'video') {
        // Cria elemento de vídeo com controles para o usuário ver com som se quiser
        const vid = document.createElement('video');
        vid.src = src;
        vid.controls = true; // Permite dar play/pause e som
        vid.autoplay = true;
        vid.style.maxHeight = '100%';
        vid.style.maxWidth = '100%';
        area.appendChild(vid);
      } else {
        // Cria imagem
        const img = document.createElement('img');
        img.src = src;
        img.alt = "Preview Full";
        area.appendChild(img);
      }

      modal.setAttribute('aria-hidden', 'false');
      
      // Pausa os carrosséis no fundo
      App.carousels.forEach(c => c.pause());
    },

    closeLightbox() {
      const modal = document.getElementById('previewModal');
      modal.setAttribute('aria-hidden', 'true');
      document.getElementById('previewArea').innerHTML = ''; // Mata o vídeo (para o som)
      
      // Retomar carrosséis
      App.carousels.forEach(c => c.resume());
    },

    // --- GALERIA 10x10 ---
    setupGallery() {
      const btns = document.querySelectorAll('.see-more-btn');
      const modal = document.getElementById('galleryModal');
      const grid = document.getElementById('lockedGrid');
      const closeBtn = document.getElementById('closeGallery');

      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        div.className = 'blur-item';
        // Randomiza o background usando os placeholders
        const randItem = CONFIG.gridPlaceholders[i % CONFIG.gridPlaceholders.length];
        // Se for mp4 no placeholder, o CSS url() não anima, vira estático (melhor para performance)
        // Mas para garantir, vamos usar apenas se for imagem, ou forçar frame se browser suportar
        div.style.backgroundImage = `url('${CONFIG.assetsPath}${randItem}')`;
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
