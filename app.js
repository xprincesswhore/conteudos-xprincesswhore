document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURAÇÕES GLOBAIS ---
  const PAYMENT_LINK = "https://go.perfectpay.com.br/PPU38CQ3I44";
  const SLIDE_DURATION = 4000; // 4 segundos por slide
  const TRANSITION_MS = 600;

  // Lista manual de arquivos (imagens e vídeos) na pasta /assets
  // Mantenha o formato 'nome_arquivo.extensao'
  const mediaFiles = [
    "1.mp4",
    "2.mp4",
    "3.mp4",
    "4.mp4",
    // Vídeos são processados se terminarem em .mp4
    // Exemplo: "video_demo.mp4"
  ];

  // --- COMPONENTES DOM ---
  const carouselRoot = document.getElementById('carouselRoot');
  const slidesEl = document.getElementById('slides');
  const indicatorsEl = document.getElementById('indicators');
  const nextBtn = document.getElementById('next');
  const prevBtn = document.getElementById('prev');

  const buyBtn = document.getElementById('buyBtn');
  const modalBack = document.getElementById('modalBack');
  const closeModal = document.getElementById('closeModal'); 
  const confirmPay = document.getElementById('confirmPay');
  const previewBtn = document.getElementById('previewBtn');
  const previewBack = document.getElementById('previewBack');
  const closePreview = document.getElementById('closePreview');
  const previewArea = document.getElementById('previewArea');

  // --- ESTADO DO CARROSSEL ---
  let slides = [];
  let dots = [];
  let idx = 0;
  let timer = null;
  let playing = true;

  // --- FUNÇÕES DE UTILIDADE ---

  /**
   * [NOVA FUNÇÃO] Seleciona aleatoriamente um arquivo da lista de mídias.
   * @returns {{file: string, isVideo: boolean, src: string}} Objeto com detalhes da mídia.
   */
  function getRandomMedia() {
    const randomIndex = Math.floor(Math.random() * mediaFiles.length);
    const file = mediaFiles[randomIndex];
    const isVideo = file.endsWith('.mp4');
    const src = file.startsWith('http') ? file : `assets/${file}`;
    return { file, isVideo, src };
  }

  // --- FUNÇÕES DO CARROSSEL ---

  /**
   * Constrói a estrutura do carrossel no DOM
   */
  function buildCarousel() {
    slidesEl.innerHTML = '';
    indicatorsEl.innerHTML = '';

    mediaFiles.forEach((file, i) => {
      const isVideo = file.endsWith('.mp4');
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.dataset.index = i;
      slide.dataset.type = isVideo ? 'video' : 'image';

      const src = file.startsWith('http') ? file : `assets/${file}`;

      if (isVideo) {
        // Usa a tag <video> com autoplay/muted para prévia
        slide.innerHTML = `<video muted playsinline preload="metadata" loop>
          <source src="${src}" type="video/mp4">
          Seu navegador não suporta vídeo.
        </video>
        <div class="caption">Vídeo ${i + 1}</div>`;
      } else {
        // Usa a tag <img>
        slide.innerHTML = `<img src="${src}" alt="Slide ${i + 1}">
        <div class="caption">Imagem ${i + 1}</div>`;
      }

      slidesEl.appendChild(slide);

      // Constrói o indicador (dot)
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.dataset.index = i;
      indicatorsEl.appendChild(dot);
    });

    // Atualiza as NodeLists
    slides = Array.from(document.querySelectorAll('#slides .slide'));
    dots = Array.from(document.querySelectorAll('#indicators .dot'));

    // Define a variável CSS para o efeito Ken-Burns
    slidesEl.style.setProperty('--slide-duration', (SLIDE_DURATION / 1000).toFixed(2) + 's');
  }

  /**
   * Inicializa o comportamento dinâmico do carrossel (timers, eventos)
   */
  function initCarousel() {
    if (slides.length === 0) return;

    if (timer) clearInterval(timer);
    idx = 0;
    showSlide(idx);
    timer = setInterval(() => { goTo(idx + 1); }, SLIDE_DURATION);

    // Controles de Navegação
    nextBtn.onclick = () => { goTo(idx + 1); resetTimer(); };
    prevBtn.onclick = () => { goTo(idx - 1); resetTimer(); };
    dots.forEach(d => d.onclick = () => { goTo(+d.dataset.index); resetTimer(); });

    // Pausar/Retomar ao passar o mouse
    carouselRoot.addEventListener('mouseenter', () => { pause(); });
    carouselRoot.addEventListener('mouseleave', () => { resume(); });
  }

  /**
   * Exibe um slide específico e controla a mídia.
   * @param {number} i - Índice do slide.
   */
  function showSlide(i) {
    const n = slides.length;
    if (n === 0) return;
    idx = ((i % n) + n) % n;

    slidesEl.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.2,.9,.2,1)`;
    slidesEl.style.transform = `translateX(-${idx * 100}%)`;

    slides.forEach((s, si) => {
      s.classList.toggle('active', si === idx);
      const v = s.querySelector('video');
      if (v) {
        // PAUSA e RESETA todos os vídeos inativos
        try { v.pause(); v.currentTime = 0; } catch (e) { /* ignore */ }
      }
    });

    const current = slides[idx];
    if (!current) return;
    const currentVideo = current.querySelector('video');
    
    if (currentVideo) {
      currentVideo.muted = true;
      currentVideo.onloadedmetadata = () => {
          currentVideo.play().catch(() => { /* autoplay bloqueado, ignora */ });
      };
      currentVideo.load(); 
    }
    
    dots.forEach(d => d.classList.remove('active'));
    if (dots[idx]) dots[idx].classList.add('active');
  }

  function goTo(i) {
    showSlide(i);
  }

  function resetTimer() {
    if (timer) clearInterval(timer);
    if(playing) {
      timer = setInterval(() => { goTo(idx + 1); }, SLIDE_DURATION);
    }
  }

  function pause() { 
    playing = false; 
    if (timer) clearInterval(timer); 
    const currentVideo = document.querySelector('.slide.active video');
    if (currentVideo) {
        try { currentVideo.pause(); } catch (e) { /* ignore */ }
    }
  }
  
  function resume() { 
    if (!playing) playing = true;
    resetTimer(); 
    const currentVideo = document.querySelector('.slide.active video');
    if (currentVideo) {
        try { currentVideo.play().catch(() => { /* autoplay bloqueado, ignora */ }); } catch (e) { /* ignore */ }
    }
  }

  // --- LÓGICA DE BOTÕES E MODAIS ---
  
  // Confirmação de compra (Modal)
  if (buyBtn) buyBtn.addEventListener('click', () => {
    modalBack.style.display = 'flex';
    modalBack.setAttribute('aria-hidden', 'false');
  });

  if (closeModal) closeModal.addEventListener('click', () => {
    modalBack.style.display = 'none';
    modalBack.setAttribute('aria-hidden', 'true');
  });

  if (confirmPay) confirmPay.addEventListener('click', () => {
    modalBack.style.display = 'none';
    modalBack.setAttribute('aria-hidden', 'true');
    window.open(PAYMENT_LINK, '_blank'); // Abre em nova aba
  });

  if (modalBack) modalBack.addEventListener('click', (e) => { 
    if (e.target === modalBack) { 
      modalBack.style.display = 'none'; 
      modalBack.setAttribute('aria-hidden', 'true'); 
    } 
  });

  // Preview Rápida (Modal) - Lógica Alterada para RANDOMIZAÇÃO
  if (previewBtn) previewBtn.addEventListener('click', () => {
    
    // 1. Pega uma mídia aleatória, NÃO a ativa do carrossel.
    const media = getRandomMedia();
    
    // Limpa a área de preview
    previewArea.innerHTML = '';

    if (media.isVideo) {
      // Cria um elemento de vídeo para o modal (com controles e som)
      const vid = document.createElement('video');
      vid.controls = true;
      vid.autoplay = true;
      vid.muted = false; // Permite áudio no modal
      vid.style.width = '100%';
      vid.style.height = '100%';
      vid.style.objectFit = 'contain';
      
      const s = document.createElement('source');
      s.src = media.src; // Usa o src aleatório
      s.type = 'video/mp4';
      vid.appendChild(s);
      
      previewArea.appendChild(vid);
      
      // Tenta reproduzir e lidar com o erro de autoplay bloqueado
      vid.play().catch(() => { /* ignore */ });

    } else {
      // Cria um elemento de imagem
      const img = document.createElement('img');
      img.src = media.src; // Usa o src aleatório
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      previewArea.appendChild(img);
    }

    previewBack.style.display = 'flex';
    previewBack.setAttribute('aria-hidden', 'false');
  });

  if (closePreview) closePreview.addEventListener('click', () => { 
    // Garante que o vídeo pare ao fechar o modal
    const videoInPreview = previewArea.querySelector('video');
    if (videoInPreview) {
      try { videoInPreview.pause(); videoInPreview.currentTime = 0; } catch (e) { /* ignore */ }
    }

    previewBack.style.display = 'none'; 
    previewBack.setAttribute('aria-hidden', 'true'); 
    previewArea.innerHTML = ''; 
  });
  
  if (previewBack) previewBack.addEventListener('click', (e) => { 
    if (e.target === previewBack) { 
       // Garante que o vídeo pare ao clicar fora
      const videoInPreview = previewArea.querySelector('video');
      if (videoInPreview) {
        try { videoInPreview.pause(); videoInPreview.currentTime = 0; } catch (e) { /* ignore */ }
      }

      previewBack.style.display = 'none'; 
      previewBack.setAttribute('aria-hidden', 'true'); 
      previewArea.innerHTML = ''; 
    } 
  });


  // --- INICIALIZAÇÃO ---
  buildCarousel();
  initCarousel();
});
