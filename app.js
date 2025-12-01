document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CONFIGURAÇÃO GLOBAL ---
  const CONFIG = {
    // Mantenha o link como fallback, mas o checkout agora é nativo
    paymentLink: "https://go.invictuspay.app.br/uiu36mqyaf",
    slideDuration: 4000,
    assetsPath: 'assets/',

    // SEUS ARQUIVOS (Necessários para o site e para o Chatbot)
    gifs: [
      "1.mp4", "2.mp4", "3.mp4", "4.mp4", "5.mp4"
    ],
    images: [
      "foto1.jpg", "foto2.jpg", "foto3.jpg", "foto4.jpg", "foto5.jpg",
      "foto6.jpg", "foto7.jpg", "foto8.jpg", "foto9.jpeg", "foto10.jpg",
      "foto11.jpg", "foto12.jpg", "foto13.jpg", "foto14.jpg", "foto15.jpg",
      "foto16.jpg", "foto17.jpg", "foto18.jpg", "foto19.jpg", "foto20.jpg"
    ]
  };

  // --- 2. CLASSE CAROUSEL (Lógica Visual) ---
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
        
        if (isVideo) {
          slideEl.innerHTML = `
            <video class="carousel-media" muted loop playsinline preload="metadata">
              <source src="${src}" type="video/mp4">
            </video>`;
        } else {
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
            const playPromise = s.videoEl.play();
            if (playPromise !== undefined) playPromise.catch(() => {});
          } else {
            s.videoEl.pause();
            s.videoEl.currentTime = 0;
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
        window.App.openLightbox(currentItem.src, currentItem.type);
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

  // --- 3. CONTROLLER PRINCIPAL (GLOBAL) ---
  window.App = {
    CONFIG: CONFIG,
    carousels: [],
    
    init() {
      // Inicializa Carrosséis
      this.carousels.push(new CarouselComponent('carousel-gifs-wrapper', CONFIG.gifs));
      this.carousels.push(new CarouselComponent('carousel-imgs-wrapper', CONFIG.images));

      // Inicializa Lightbox e Galeria
      this.setupLightbox();
      this.setupGallery();
      
      // Inicializa Módulo de Checkout (Novo)
      this.setupCheckout();
    },

    // --- Módulo Lightbox (Preview) ---
    setupLightbox() {
      document.getElementById('closePreview').addEventListener('click', this.closeLightbox);
      document.getElementById('previewModal').addEventListener('click', (e) => {
        if(e.target.id === 'previewModal') this.closeLightbox();
      });
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
      this.carousels.forEach(c => c.pause());
    },

    closeLightbox() {
      const modal = document.getElementById('previewModal');
      modal.setAttribute('aria-hidden', 'true');
      document.getElementById('previewArea').innerHTML = '';
      window.App.carousels.forEach(c => c.resume());
    },

    // --- Módulo Galeria (Grade Bloqueada) ---
    setupGallery() {
      const btns = document.querySelectorAll('.see-more-btn');
      const modal = document.getElementById('galleryModal');
      const grid = document.getElementById('lockedGrid');
      const closeBtn = document.getElementById('closeGallery');

      const fragment = document.createDocumentFragment();
      const colors = ['#1a1a1a', '#222', '#2a2a2a', '#111', '#1f1f1f'];
      
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        div.className = 'blur-item';
        const color = colors[Math.floor(Math.random() * colors.length)];
        div.style.background = color;
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
    },

    // --- 4. MÓDULO CHECKOUT (NOVO INTEGRADO) ---
    openCheckout() {
        const checkoutModal = document.getElementById('checkoutModal');
        if(checkoutModal) checkoutModal.setAttribute('aria-hidden', 'false');
    },

    setupCheckout() {
        const checkoutModal = document.getElementById('checkoutModal');
        const pixModal = document.getElementById('pixModal');
        const form = document.getElementById('paymentForm');
        
        // Listeners para botões de compra (Substitui link externo pelo modal)
        document.querySelectorAll('.action-buy').forEach(btn => {
            // Remove listeners antigos (clone)
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCheckout();
            });
        });

        // Fechar Modais
        const closeCheck = document.querySelector('.close-checkout');
        const closePix = document.querySelector('.close-pix');
        if(closeCheck) closeCheck.onclick = () => checkoutModal.setAttribute('aria-hidden', 'true');
        if(closePix) closePix.onclick = () => pixModal.setAttribute('aria-hidden', 'true');

        // Máscaras
        const maskCPF = v => v.replace(/\D/g,"").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2");
        const maskPhone = v => v.replace(/\D/g,"").replace(/^(\d{2})(\d)/g,"($1) $2").replace(/(\d)(\d{4})$/,"$1-$2");
        const maskCEP = v => v.replace(/\D/g,"").replace(/^(\d{5})(\d)/,"$1-$2");

        const cpfInput = document.getElementById('inputCpf');
        const phoneInput = document.getElementById('inputPhone');
        const cepInput = document.getElementById('inputCep');

        if(cpfInput) cpfInput.addEventListener('input', e => e.target.value = maskCPF(e.target.value));
        if(phoneInput) phoneInput.addEventListener('input', e => e.target.value = maskPhone(e.target.value));
        
        // ViaCEP Logic
        if(cepInput) {
            cepInput.addEventListener('input', e => e.target.value = maskCEP(e.target.value));
            cepInput.addEventListener('blur', async () => {
                const cep = cepInput.value.replace(/\D/g, '');
                if (cep.length === 8) {
                    const wrapper = cepInput.parentElement;
                    wrapper.classList.add('is-loading');
                    try {
                        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                        const data = await res.json();
                        if (!data.erro) {
                            document.getElementById('inputRua').value = data.logradouro;
                            document.getElementById('inputBairro').value = data.bairro;
                            document.getElementById('inputCidade').value = data.localidade;
                            document.getElementById('inputUf').value = data.uf;
                            document.querySelector('input[name="number"]').focus();
                        }
                    } catch (e) { console.error(e); } 
                    finally { wrapper.classList.remove('is-loading'); }
                }
            });
        }

        // Form Submit & PIX Generator
        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                const originalHtml = btn.innerHTML;
                
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';
                btn.disabled = true;

                // Simulação de Sucesso (Substituir por fetch real da Invictus)
                setTimeout(() => {
                    const mockPixCode = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000520400005303986540520.005802BR5913Invictus Pay6008Brasilia62070503***6304E2CA";
                    const mockQr = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + mockPixCode;

                    const qrImg = document.getElementById('qrCodeImage');
                    const qrPlace = document.getElementById('qrPlaceholder');
                    const pixText = document.getElementById('pixCodeTextarea');

                    if(qrImg) { qrImg.src = mockQr; qrImg.style.display = 'block'; }
                    if(qrPlace) qrPlace.style.display = 'none';
                    if(pixText) pixText.value = mockPixCode;

                    checkoutModal.setAttribute('aria-hidden', 'true');
                    pixModal.setAttribute('aria-hidden', 'false');

                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                }, 1500);
            });
        }

        // Botão Copiar
        const copyBtn = document.getElementById('copyPixButton');
        if(copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Evita refresh
                const copyText = document.getElementById("pixCodeTextarea");
                copyText.select();
                document.execCommand("copy");
                
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                copyBtn.style.background = '#4ade80';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                    copyBtn.style.background = '';
                }, 2000);
            });
        }
    }
  };

  // Inicializa o App
  window.App.init();
});
