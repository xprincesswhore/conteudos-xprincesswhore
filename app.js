document.addEventListener("DOMContentLoaded", () => {
  const CONFIG = {
    paymentLink: "https://go.invictuspay.app.br/uiu36mqyaf", 
    discountLink: "https://go.invictuspay.app.br/uiu36mqyaf", 
    slideDuration: 4000,
    assetsPath: 'assets/',
    gifs: ["1.mp4", "2.mp4", "3.mp4", "4.mp4", "5.mp4"],
    images: [
      "foto1.jpg", "foto2.jpg", "foto3.jpg", "foto4.jpg", "foto5.jpg",
      "foto6.jpg", "foto7.jpg", "foto8.jpg", "foto9.jpeg", "foto10.jpg"
    ]
  };

  class CarouselComponent {
    constructor(wrapperId, mediaList) {
      this.wrapper = document.getElementById(wrapperId);
      if (!this.wrapper) return;

      this.mediaList = mediaList;
      this.currentIndex = 0;
      this.timer = null;
      this.slidesRef = [];

      this.els = {
        container: this.wrapper.querySelector('.slides'),
        indicators: this.wrapper.querySelector('.indicators'),
        root: this.wrapper.querySelector('.carousel')
      };

      this.init();
    }

    init() {
      this.els.container.innerHTML = '';
      this.els.indicators.innerHTML = '';
      
      this.mediaList.forEach((file, index) => {
        const src = file.startsWith('http') ? file : `${CONFIG.assetsPath}${file}`;
        const isVideo = file.toLowerCase().endsWith('.mp4');
        
        const slideEl = document.createElement('div');
        slideEl.className = 'slide';
        
        if (isVideo) {
          slideEl.innerHTML = `
            <video muted loop playsinline preload="metadata">
              <source src="${src}" type="video/mp4">
            </video>`;
        } else {
          slideEl.innerHTML = `<img src="${src}" loading="lazy" alt="Slide ${index}">`;
        }
        
        this.els.container.appendChild(slideEl);

        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => this.goToSlide(index);
        this.els.indicators.appendChild(dot);

        this.slidesRef.push({ 
          src, 
          type: isVideo ? 'video' : 'image',
          videoEl: isVideo ? slideEl.querySelector('video') : null
        });
      });

      this.bindEvents();
      this.startTimer();
      // CHANGE: ensure videos are paused on load (do not autoplay)
      this.pauseAllVideos();
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
            if (playPromise !== undefined) playPromise.catch(() => {
                s.videoEl.muted = true;
                s.videoEl.play().catch(e => console.log('Autoplay blocked'));
            });
          } else {
            s.videoEl.pause();
            s.videoEl.currentTime = 0;
          }
        }
      });
    }
    
    pauseAllVideos() {
        this.slidesRef.forEach(s => {
            if(s.videoEl) {
                try { s.videoEl.pause(); s.videoEl.currentTime = 0; } catch (e) {}
            }
        });
        this.pause();
    }

    next() { this.goToSlide(this.currentIndex + 1); }
    prev() { this.goToSlide(this.currentIndex - 1); }

    startTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(() => this.next(), CONFIG.slideDuration);
    }
    
    resetTimer() {
      clearInterval(this.timer);
      this.startTimer();
    }
    
    pause() { clearInterval(this.timer); }
    resume() { 
        this.startTimer(); 
        this.handleVideoPlayback(); 
    }

    bindEvents() {
      const nextBtn = this.wrapper.querySelector('.next-btn');
      const prevBtn = this.wrapper.querySelector('.prev-btn');
      const prevTrigger = this.wrapper.querySelector('.preview-trigger');

      if(nextBtn) nextBtn.onclick = () => this.next();
      if(prevBtn) prevBtn.onclick = () => this.prev();
      
      if(prevTrigger) {
        prevTrigger.onclick = () => {
            const item = this.slidesRef[this.currentIndex];
            App.openLightbox(item.src, item.type);
        };
      }

      let xDown = null;
      this.els.root.addEventListener('touchstart', e => xDown = e.touches[0].clientX, {passive: true});
      this.els.root.addEventListener('touchmove', e => {
        if (!xDown) return;
        let xUp = e.touches[0].clientX;
        let xDiff = xDown - xUp;
        if (Math.abs(xDiff) > 50) { 
           xDiff > 0 ? this.next() : this.prev();
           xDown = null;
        }
      }, {passive: true});
    }
  }

  const App = {
    carousels: [],
    exitIntentShown: false, 

    init() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('is-visible'); });
      }, { threshold: 0.1 });
      document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

      this.carousels.push(new CarouselComponent('carousel-gifs-wrapper', CONFIG.gifs));
      this.carousels.push(new CarouselComponent('carousel-imgs-wrapper', CONFIG.images));

      document.querySelectorAll('.action-buy').forEach(btn => {
        this.setupBuyButton(btn, CONFIG.paymentLink);
      });

      document.querySelectorAll('.action-buy-discount').forEach(btn => {
        this.setupBuyButton(btn, CONFIG.discountLink);
      });

      this.setupModals();
      this.setupExitIntent(); 
      this.setupGalleryGrid();
      
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            this.carousels.forEach(c => c.pauseAllVideos());
        } else {
            this.carousels.forEach(c => c.resume());
        }
      });
    },

    setupBuyButton(btn, link) {
        btn.addEventListener('click', () => {
            const oldText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AGUARDE...';
            btn.disabled = true;
            setTimeout(() => {
                window.open(link, '_blank');
                setTimeout(() => {
                    btn.innerHTML = oldText;
                    btn.disabled = false;
                }, 2000);
            }, 500);
        });
    },

    setupModals() {
      const pModal = document.getElementById('previewModal');
      const gModal = document.getElementById('galleryModal');
      const eModal = document.getElementById('exitModal'); 
      
      document.getElementById('closePreview').onclick = () => {
          pModal.setAttribute('aria-hidden', 'true');
          document.getElementById('previewArea').innerHTML = '';
          this.carousels.forEach(c => c.resume());
      };

      document.getElementById('closeGallery').onclick = () => gModal.setAttribute('aria-hidden', 'true');
      
      const closeExitFunc = () => eModal.setAttribute('aria-hidden', 'true');
      document.getElementById('closeExit').onclick = closeExitFunc;
      document.getElementById('rejectOffer').onclick = closeExitFunc;

      document.querySelectorAll('.see-more-btn').forEach(btn => {
          btn.onclick = () => gModal.setAttribute('aria-hidden', 'false');
      });
    },

    setupExitIntent() {
        const hasShownToday = localStorage.getItem('exitIntentShown_' + new Date().toDateString());
        if (hasShownToday) return;

        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 0 && !this.exitIntentShown) {
                this.showExitModal();
            }
        });

        setTimeout(() => {
            if (!this.exitIntentShown) {
                this.showExitModal();
            }
        }, 45000); 
    },

    showExitModal() {
        this.exitIntentShown = true;
        const eModal = document.getElementById('exitModal');
        eModal.setAttribute('aria-hidden', 'false');
        localStorage.setItem('exitIntentShown_' + new Date().toDateString(), 'true');
    },

    setupGalleryGrid() {
        const grid = document.getElementById('lockedGrid');
        if(!grid) return;
        if(grid.children.length > 0) return; 

        const fragment = document.createDocumentFragment();
        const colors = ['#222', '#1a1a1a', '#2a2a2a'];
        
        for(let i=0; i<100; i++) {
            const div = document.createElement('div');
            div.className = 'blur-item';
            div.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
            fragment.appendChild(div);
        }
        grid.appendChild(fragment);
    },

    openLightbox(src, type) {
        this.carousels.forEach(c => c.pauseAllVideos());
        const pModal = document.getElementById('previewModal');
        const area = document.getElementById('previewArea');
        area.innerHTML = '';
        
        if(type === 'video') {
            const v = document.createElement('video');
            v.src = src; v.controls = true; v.autoplay = true;
            area.appendChild(v);
        } else {
            const img = document.createElement('img');
            img.src = src;
            area.appendChild(img);
        }
        pModal.setAttribute('aria-hidden', 'false');
    }
  };

  // CHANGE: expose App to window so chatbot image click can call openLightbox safely
  window.App = App;

  App.init();
});