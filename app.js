// Auto-load carousel images from assets/assets.json
fetch('assets/assets.json')
  .then(res => res.json())
  .then(data => {
    const slidesEl = document.getElementById('slides');
    const indicators = document.getElementById('indicators');
    slidesEl.innerHTML = '';
    indicators.innerHTML = '';
    data.files.forEach((file, i) => {
      const isVideo = /\.(mp4|webm|mov)$/i.test(file);
      const slide = document.createElement('div');
      slide.className = 'slide' + (i === 0 ? ' active' : '');
      slide.dataset.type = isVideo ? 'video' : 'image';
      if (isVideo) {
        slide.innerHTML = `<video muted playsinline preload="metadata" loop>
          <source src="assets/${file}" type="video/mp4">
        </video><div class="caption">Vídeo ${i + 1}</div>`;
      } else {
        slide.innerHTML = `<img src="assets/${file}" alt="Slide ${i + 1}">
        <div class="caption">Imagem ${i + 1}</div>`;
      }
      slidesEl.appendChild(slide);
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.dataset.index = i;
      indicators.appendChild(dot);
    });
    initCarousel();
  });

// Carousel logic
function initCarousel() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const slidesEl = document.getElementById('slides');
  let idx = 0;
  const INTERVAL = 5000;
  let timer = setInterval(next, INTERVAL);

  function goTo(i) {
    slides[idx].classList.remove('active');
    dots[idx].classList.remove('active');
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add('active');
    dots[idx].classList.add('active');
    slidesEl.style.transform = `translateX(-${idx * 100}%)`;
  }
  function next(){ goTo(idx + 1); }
  function prev(){ goTo(idx - 1); }

  document.getElementById('next').onclick = () => { next(); reset(); };
  document.getElementById('prev').onclick = () => { prev(); reset(); };
  dots.forEach(d => d.onclick = () => { goTo(+d.dataset.index); reset(); });

  function reset(){ clearInterval(timer); timer = setInterval(next, INTERVAL); }
}

// Modal & preview
const buyBtn = document.getElementById('buyBtn');
const modalBack = document.getElementById('modalBack');
const cancelModal = document.getElementById('cancelModal');
const confirmPay = document.getElementById('confirmPay');
const previewBtn = document.getElementById('previewBtn');
const previewBack = document.getElementById('previewBack');
const closePreview = document.getElementById('closePreview');
const previewArea = document.getElementById('previewArea');
const PAYMENT_LINK = '#'; // insira o link real

buyBtn.onclick = () => modalBack.style.display = 'flex';
cancelModal.onclick = () => modalBack.style.display = 'none';
confirmPay.onclick = () => { modalBack.style.display='none'; if(PAYMENT_LINK!=='#') window.location=PAYMENT_LINK; else alert('Configure PAYMENT_LINK'); };
modalBack.onclick = e => { if(e.target===modalBack) modalBack.style.display='none'; };

previewBtn.onclick = () => {
  const active = document.querySelector('.slide.active');
  previewArea.innerHTML = active.dataset.type === 'video'
    ? `<video controls autoplay><source src="${active.querySelector('source')?.src}"></video>`
    : `<img src="${active.querySelector('img').src}" style="width:100%">`;
  previewBack.style.display = 'flex';
};
closePreview.onclick = () => { previewBack.style.display='none'; previewArea.innerHTML=''; };
previewBack.onclick = e => { if(e.target===previewBack){ previewBack.style.display='none'; previewArea.innerHTML=''; } };
