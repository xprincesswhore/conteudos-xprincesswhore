# 💜 xprincesswhore - Exclusive Content Portal

Um portal web imersivo e responsivo focado em criadores de conteúdo adulto. O projeto utiliza design "Glassmorphism" com tema dark, incluindo um chatbot interativo com persona definida, galerias de mídia protegidas e um sistema de checkout simulado com geração de PIX.

## ✨ Funcionalidades

### 1. 🤖 Chatbot com Persona (Roleplay)
* **Lógica de Árvore de Decisão:** Respostas pré-definidas baseadas em palavras-chave e navegação por botões.
* **Persona "xprincesswhore":** Tom provocativo, uso de emojis e fluxo focado em conversão de vendas.
* **Interatividade:** Simulação de digitação ("typing..."), envio de "fotos privadas" (fake upload) e ofertas dinâmicas.
* **Integração Global:** Acessa a configuração global do site para enviar mídias reais da galeria.

### 2. 📸 Galeria & Mídia
* **Carrossel Misto:** Suporte para Imagens e Vídeos (MP4) com autoplay inteligente.
* **Lightbox:** Visualização de mídia em tela cheia sem sair da página.
* **Paywall Visual:** Grade de "100 arquivos" borrada via CSS (leve e performática) para incentivar a assinatura.

### 3. 💸 Checkout Nativo (Transparente)
* **Sem Redirecionamento:** Todo o processo de compra ocorre dentro de um modal no site.
* **UX Otimizada:**
    * Busca automática de endereço via **API ViaCEP**.
    * Máscaras de input automáticas (CPF, Telefone, CEP).
    * Feedback visual de carregamento.
* **Simulação de Pagamento:** Gera um QR Code PIX visual e código "Copia e Cola" para demonstração.

## 🛠️ Tecnologias Utilizadas

* **HTML5 Semântico**
* **CSS3 Moderno:** Flexbox, Grid, Animações (`keyframes`), Variáveis CSS e Backdrop-filter.
* **JavaScript (ES6+):** POO (Programação Orientada a Objetos), Async/Await, Manipulação de DOM.
* **APIs Externas:**
    * [ViaCEP](https://viacep.com.br/) (Autocompletar endereço).
    * [QRServer](https://goqr.me/api/) (Geração visual do QR Code).
* **Ícones:** FontAwesome 6.
* **Fontes:** Google Fonts (Outfit & Space Grotesk).

---

## 📂 Estrutura de Arquivos

```text
/
├── index.html       # Estrutura principal e Modais
├── styles.css       # Estilos globais, Chat e Checkout
├── app.js           # Lógica Principal (Galeria + Checkout + Config Global)
├── chatbot.js       # Lógica exclusiva do Chatbot
├── assets/          # Pasta para imagens e vídeos (.jpg, .mp4)
└── README.md        # Documentação
