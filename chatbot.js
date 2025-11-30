document.addEventListener("DOMContentLoaded", () => {

  /* ===========================
     CONFIGURAÇÕES
     =========================== */
  const CONFIG = {
    paymentLink: "https://go.invictuspay.app.br/uiu36mqyaf",
    freePhotoUrl: "assets/foto1.jpg",
    typingBase: 28, // Velocidade de digitação
    flirtDelay: 3,  // Interações mínimas antes de liberar o botão de compra
    autoOpenDelay: 3000
  };

  /* ===========================
     BANCO DE RESPOSTAS (TEXTOS DO SCRIPT 1)
     =========================== */
  const RESPONSE_STORE = {
    // Flerte / Saudação provocante
    flirt: [
      "Hummm… fala comigo assim que eu fico toda boba 😏",
      "Nossa… você sabe mexer comigo, viu?",
      "Chega mais… tô sozinha e meio carente 👀",
      "Desse jeito eu fico molhadinha rapidinho…",
      "Tô melhor agora que você apareceu…",
      "Tava justamente pensando em alguém pra me fazer companhia…"
    ],
    // Desejo / Safadeza
    desire: [
      "Você tá me deixando quente… continua 😈",
      "Adoro quando você fala assim… fico molhadinha só de imaginar…",
      "Sobe aqui… quero sentir sua imaginação em mim…"
    ],
    // Curiosidade sobre o conteúdo
    curiosity: [
      "No vídeo eu faço exatamente o que você tá imaginando agora…",
      "É explícito… quente… e proibido pra maioria. 👀"
    ],
    // Respostas de Venda (antes do botão)
    sales_offer: [
      "Se você quiser mesmo… eu te passo agora 👀",
      "O acesso é na hora… sigiloso… e bem quente 😈"
    ],
    // Fallback (quando não entende)
    fallback: [
      "Humm… fala de novo, amor… acho que adorei isso 😏",
      "Repete pra mim… fiquei imaginando outra coisa aqui 👀",
      "Não entendi… mas adorei o clima… continua 😈",
      "Fala comigo… adoro quando você toma iniciativa…"
    ]
  };

  /* ===========================
     GATILHOS (TRIGGERS DO SCRIPT 1 ADAPTADOS)
     =========================== */
  const TRIGGERS = {
    buy: [
      /comprar/i, /link/i, /acesso/i, /preco/i, /valor/i, /pix/i,
      /quero\b/i, /me da\b/i, /pagar/i
    ],
    horny: [
      /tesao/i, /molhada/i, /duro/i, /gozar/i,
      /quero voce/i, /vem pra ca/i, /me excita/i, /quente/i
    ],
    photo: [
      /foto/i, /manda/i, /me mostra/i, /ver vc/i, /nude/i
    ],
    curiosity: [
      /video/i, /o que tem/i, /conteudo/i, /mostra/i
    ],
    flirt: [
      /oi\b/i, /ola\b/i, /hey\b/i, /opa\b/i, /tudo bem/i,
      /gostosa/i, /delicia/i, /gata/i, /linda/i, /perfeita/i, /safada/i,
      /me fala/i, /fala comigo/i, /saudade/i
    ]
  };

  /* ===========================
     MOTOR DO CHAT (LÓGICA DO SCRIPT 2)
     =========================== */
  class ChatEngine {
    constructor() {
      this.els = {
        widget: document.getElementById("chatbot"),
        window: document.querySelector(".chat-window"),
        msgs: document.getElementById("chatMessages"),
        input: document.getElementById("chatInput"),
        quickOpts: document.getElementById("quickOptions"),
        sendBtn: document.getElementById("chatSend"),
        toggleBtn: document.getElementById("chatToggle"),
        closeBtn: document.querySelector(".close-chat"),
        badge: document.querySelector(".notification-dot")
      };

      this.state = {
        isOpen: false,
        isTyping: false,
        interactions: 0,
        sentFreePhoto: false
      };

      this.init();
    }

    init() {
      this.bindEvents();

      // MENSAGEM INICIAL DO SCRIPT 1
      this.addBotMessage([
        "Oi amor… tava justamente querendo alguém pra brincar comigo 😏",
        "O que você quer fazer comigo primeiro?"
      ]);

      setTimeout(() => {
        if (!this.state.isOpen) this.els.badge.classList.add("pulse-active");
      }, CONFIG.autoOpenDelay);
    }

    /* --- Processamento de Texto --- */

    normalize(text) {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.,!?]/g, " ")
        .trim();
    }

    matchAny(list, text) {
      return list.some(rx => rx.test(text));
    }

    detectIntent(text) {
      const clean = this.normalize(text);

      // Prioridade de detecção
      if (this.matchAny(TRIGGERS.buy, clean)) return "buy";
      if (this.matchAny(TRIGGERS.photo, clean)) return "photo";
      if (this.matchAny(TRIGGERS.horny, clean)) return "desire";
      if (this.matchAny(TRIGGERS.curiosity, clean)) return "curiosity";
      if (this.matchAny(TRIGGERS.flirt, clean)) return "flirt";

      return "fallback";
    }

    getRandom(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    /* --- Helpers de UI --- */

    addBotMessage(lines) {
      lines.forEach(line => {
        const div = document.createElement("div");
        div.className = "message bot";
        div.innerHTML = `<div class="bubble">${line}</div>`;
        this.els.msgs.appendChild(div);
      });
      this.scrollBottom();
    }

    addUserMessage(text) {
      const div = document.createElement("div");
      div.className = "message user";
      div.innerHTML = `<div class="bubble">${text}</div>`;
      this.els.msgs.appendChild(div);
      this.scrollBottom();
    }

    addPhotoMessage(url) {
      const div = document.createElement("div");
      div.className = "message bot";
      const wrap = document.createElement("div");
      wrap.className = "bubble photo-bubble";
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Foto";
      img.loading = "lazy";
      img.onclick = () => { if (window.App?.openLightbox) window.App.openLightbox(url, "image"); };
      
      wrap.appendChild(img);
      div.appendChild(wrap);
      this.els.msgs.appendChild(div);
      this.scrollBottom();
    }

    scrollBottom() {
      this.els.msgs.scrollTop = this.els.msgs.scrollHeight;
    }

    async simulateTyping(lines, action = null) {
      for (const line of lines) {
        const typing = document.createElement("div");
        typing.className = "typing-indicator";
        typing.innerHTML = "<span></span><span></span><span></span>";
        this.els.msgs.appendChild(typing);
        this.scrollBottom();

        // Tempo de digitação baseado no tamanho da frase
        await new Promise(r => setTimeout(r, Math.max(800, line.length * CONFIG.typingBase)));

        typing.remove();

        const div = document.createElement("div");
        div.className = "message bot";
        div.innerHTML = `<div class="bubble">${line}</div>`;
        this.els.msgs.appendChild(div);
        this.scrollBottom();
      }

      // Dispara ação de venda
      if (action === "offer_link") {
        // Verifica se já interagiu o suficiente para ofertar
        if (this.state.interactions >= CONFIG.flirtDelay) {
            this.addCTA();
        }
      }
    }

    addCTA() {
      const wrap = document.createElement("div");
      wrap.className = "chat-cta-wrapper";
      // BOTÃO COM TEXTO DO SCRIPT 1
      wrap.innerHTML = `
        <a href="${CONFIG.paymentLink}" target="_blank" class="chat-main-btn pulse-btn">
            🔥 QUERO TE VER AGORA
        </a>
        <div class="cta-sub">Acesso imediato e sigiloso</div>
      `;
      this.els.msgs.appendChild(wrap);
      this.scrollBottom();
    }

    /* --- Fluxos Especiais --- */

    async handlePhotoFlow() {
      // Se já enviou foto antes:
      if (this.state.sentFreePhoto) {
        await this.simulateTyping([
          "Eu já te dei um gostinho, né? 👀",
          "Continua me provocando assim que eu mostro mais…"
        ]);
        return;
      }

      this.state.sentFreePhoto = true;

      // TEXTO DO SCRIPT 1 NA HORA DA FOTO
      await this.simulateTyping([
        "Tá com pressa pra ver minha raba, né? 😏",
        "Você quer ver mesmo? Eu deixo… mas só um gostinho primeiro.",
        "Mas olha rápido… eu fico tímida 😳"
      ]);

      // Simulação de upload visual
      const indicator = document.createElement("div");
      indicator.className = "upload-indicator";
      indicator.innerHTML = `<div class="progress-bar"><div class="fill"></div></div><small>Enviando foto...</small>`;
      this.els.msgs.appendChild(indicator);
      this.scrollBottom();

      await new Promise(r => setTimeout(r, 1500));
      indicator.remove();

      this.addPhotoMessage(CONFIG.freePhotoUrl);
    }

    /* --- Processamento Principal --- */

    async processInput(text) {
      if (!text.trim() || this.state.isTyping) return;

      this.addUserMessage(text);
      this.els.input.value = "";
      this.state.interactions++;

      const intent = this.detectIntent(text);

      // 1. Fluxo de Foto
      if (intent === "photo") {
        await this.handlePhotoFlow();
        return;
      }

      // 2. Definir Resposta baseada na intenção
      let responseLines = [];
      let action = null;

      switch (intent) {
        case "buy":
          responseLines = [ this.getRandom(RESPONSE_STORE.sales_offer) ];
          action = "offer_link"; // Isso vai disparar o botão
          break;
        case "desire":
          responseLines = [ this.getRandom(RESPONSE_STORE.desire) ];
          break;
        case "curiosity":
          responseLines = [ this.getRandom(RESPONSE_STORE.curiosity) ];
          break;
        case "flirt":
          responseLines = [ this.getRandom(RESPONSE_STORE.flirt) ];
          break;
        default:
          responseLines = [ this.getRandom(RESPONSE_STORE.fallback) ];
      }

      this.state.isTyping = true;
      await this.simulateTyping(responseLines, action);
      this.state.isTyping = false;
    }

    bindEvents() {
      const toggle = () => {
        this.state.isOpen = !this.state.isOpen;
        this.els.window.setAttribute("aria-hidden", !this.state.isOpen);
        if (this.els.toggleBtn) this.els.toggleBtn.style.display = this.state.isOpen ? "none" : "";
      };

      if (this.els.toggleBtn) this.els.toggleBtn.onclick = toggle;
      if (this.els.closeBtn) this.els.closeBtn.onclick = toggle;

      if (this.els.sendBtn) this.els.sendBtn.onclick = () => this.processInput(this.els.input.value);

      if (this.els.input) {
        this.els.input.addEventListener("keydown", e => {
          if (e.key === "Enter") {
            e.preventDefault();
            this.processInput(this.els.input.value);
          }
        });
      }

      if (this.els.quickOpts) {
        this.els.quickOpts.onclick = (e) => {
          if (e.target.classList.contains("opt-btn")) {
            this.processInput(e.target.dataset.msg || e.target.innerText);
          }
        };
      }
    }
  }

  // Iniciar
  new ChatEngine();

});
