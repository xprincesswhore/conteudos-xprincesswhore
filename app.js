async function carregarAssets() {
  try {
    const response = await fetch('assets/assets.json');
    const data = await response.json();

    const track = document.getElementById("carousel-track");
    track.innerHTML = '';

    data.files.forEach(file => {
      const ext = file.split('.').pop().toLowerCase();
      const path = `assets/${file}`;

      if (ext === 'mp4') {
        const vid = document.createElement('video');
        vid.src = path;
        vid.autoplay = true;
        vid.loop = true;
        vid.muted = true;
        vid.classList.add('fade-video');
        track.appendChild(vid);
      } else {
        const img = document.createElement('img');
        img.src = path;
        img.alt = file;
        img.classList.add('fade-image');
        track.appendChild(img);
      }
    });
  } catch (err) {
    console.error('Erro ao carregar assets:', err);
  }
}

carregarAssets();
