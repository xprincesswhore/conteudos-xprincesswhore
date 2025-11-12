// Imagens do carrossel (adicione quantas quiser na pasta /assets)
const imagens = [
  "assets/img1.jpg",
  "assets/img2.jpg",
  "assets/img3.jpg",
  "assets/img4.jpg",
];

// Função para renderizar dinamicamente o carrossel
const carousel = document.getElementById("carousel");

imagens.forEach((src) => {
  const img = document.createElement("img");
  img.src = src;
  carousel.appendChild(img);
});

// Botão de pagamento (exemplo fixo)
document.getElementById("btn-pagamento").addEventListener("click", () => {
  window.location.href = "https://pagamento.seguro.demo";
});
