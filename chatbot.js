document.addEventListener("DOMContentLoaded", () => {

  /* ===========================
     CONFIGURAÇÕES GERAIS
     =========================== */
  const CONFIG = {
    paymentLink: "https://go.invictuspay.app.br/uiu36mqyaf",
    // freePhotoUrl: "assets/foto1.jpg", // OBS: Não é mais usado diretamente, agora puxamos da lista.
    typingSpeed: 35, // ms por caractere
    messageDelay: 800 // atraso entre balões
  };

  /* ===========================
     ÁRVORE DE DECISÃO (FLOW SCRIPT EXPANDIDO)
     =========================== */
  const CONVERSATION_TREE = {
    start: {
      text: [
        "Oi amor... 😈",
        "Você demorou, mas chegou na hora certa.",
        "Como eu te provoco hoje?"
      ],
      options: [
        { label: "Quero ver o que você está fazendo", next: "intro_doing" },
        { label: "O que tem de novo?", next: "photos_intro" },
        { label: "Me diz o que você quer de mim", next: "tease_escalate" }
      ]
    },

    // --- RAMO DE PROVOCAÇÃO E FLERTE (EXPANDIDO) ---
    intro_doing: {
      text: [
        "Tô aqui na cama, o dedo na tela... mas a mente tá ocupada com você.",
        "Diz aí: você gosta de quem manda ou de quem obedece? 😏"
      ],
      options: [
        { label: "Gosto de assumir o controle", next: "tease_dom" },
        { label: "Gosto de ser mandado", next: "tease_sub" }
      ]
    },

    tease_dom: {
      text: [
        "Hummm, você tem atitude. Isso me deixa molhada.",
        "Mas pra mandar em mim, você tem que me pagar. Vai encarar?"
      ],
      options: [
        { label: "Claro que encaro", next: "sales_challenge" },
        { label: "Melhor ver suas fotos primeiro...", next: "photos_negotiation" }
      ]
    },

    tease_sub: {
      text: [
        "Bom garoto. Eu gosto de ensinar.",
        "Pra começar, quero que você me diga que me quer. Fala a verdade."
      ],
      options: [
        { label: "Eu te quero", next: "climax_horny" }
      ]
    },

    tease_escalate: {
      text: [
        "Eu quero tudo de você... mas vamos por partes.",
        "O que te deixa mais louco? Meu rosto ou meu corpo?"
      ],
      options: [
        { label: "O Corpo", next: "photos_negotiation" },
        { label: "O Rosto", next: "tease_face" }
      ]
    },

    tease_face: {
      text: [
        "Ah, gosta do olhar de safada, né? 👀",
        "E o que você faria se eu te desse um beijo agora?"
      ],
      options: [
        { label: "Eu pararia tudo", next: "sales_urgent" },
        { label: "Eu te pegaria de jeito", next: "climax_horny" }
      ]
    },

    // --- RAMO DE FOTOS (FREE INCENTIVE) ---
    photos_intro: {
      text: [
        "O que tem de novo? Hummm... eu gravei um vídeo agorinha.",
        "Vou te mandar uma foto *secreta* que não tá no meu Insta, pra te dar um gostinho. 🤫"
      ],
      options: [
        { label: "Sim, manda agora!", next: "photos_send" }
      ]
    },

    photos_negotiation: {
      text: [
        "Você é apressadinho, hein? Eu gosto.",
        "Vou te mandar um presentinho pra te acalmar. É um dos meus vídeos favoritos..."
      ],
      options: [
        { label: "Aceito o presente", next: "photos_send" }
      ]
    },

    photos_send: {
      type: "action_photo", // Gatilho para enviar a foto (agora aleatória)
      text: [
        "Aproveita que daqui a pouco eu apago... 🤫",
        "👇"
      ],
      options: [
        { label: "Nossa! Quero ver o resto 🔥", next: "sales_after_photo" },
        { label: "Você é incrível...", next: "climax_visual" }
      ]
    },
    
    // --- CLÍMAX E VENDAS ---
    climax_horny: {
      text: [
        "Desse jeito eu não aguento ficar só na conversa. 💦",
        "Chega de papo. Você precisa ver o que eu faço de verdade."
      ],
      options: [
        { label: "Vamos ver então", next: "sales_checkout" }
      ]
    },

    climax_visual: {
      text: [
        "Que bom que gostou. A foto é só o começo.",
        "O acesso vitalício libera 100% de mim. Quer ver?"
      ],
      options: [
        { label: "LIBERAR TUDO AGORA", next: "sales_checkout" }
      ]
    },

    // --- RAMOS DE VENDA (CONVERSÃO) ---
    sales_challenge: {
      text: [
        "Se quer me dominar, precisa mostrar que tem poder de compra, amor.",
        "Clica no botão, te espero lá. 💋"
      ],
      options: [
        { label: "VOU PAGAR PRA VER", next: "sales_checkout" }
      ]
    },

    sales_urgent: {
      text: [
        "Sem tempo pra joguinhos. Eu gosto disso.",
        "Seu acesso está liberado. 👇"
      ],
      options: [
        { label: "ACESSAR AGORA 🔥", next: "sales_checkout" }
      ]
    },

    sales_after_photo: {
      text: [
        "Você viu a diferença? O conteúdo exclusivo é 10x melhor.",
        "Aproveita que eu tô online e libera o resto."
      ],
      options: [
        { label: "LIBERAR VÍDEO COMPLETO", next: "sales_checkout" }
      ]
    },
    
    // --- ESTADO FINAL (CHECKOUT) ---
    sales_checkout: {
      type: "action_checkout",
      text: [
        "O portal está aberto e ninguém vai saber que você entrou. É nosso segredo.",
        "Clica no botão abaixo, me encontre no VIP. 😘"
      ],
      options: [] // Fim da linha
    }
  };

  /* ===========================
     ENGINE (LÓGICA)
     =========================== */
  class DecisionTreeEngine {
    constructor() {
      this.els = {
        window: document.querySelector(".chat-window"),
        msgs: document.getElementById("chatMessages"),
        inputArea: document.querySelector(".chat-input-area"), 
        quickOpts: document.getElementById("quickOptions"), // Objeto antigo, agora não usado para botões
        toggleBtn: document.getElementById("chatToggle"),
        closeBtn: document.querySelector(".close-chat"),
        badge: document.querySelector(".notification-dot")
      };

      this.state = {
        isOpen: false,
        isTyping: false,
        currentNode: null
      };

      this.init();
    }

    init() {
      // 1. Ajuste de UI: Esconde o container antigo de botões
      this.els.inputArea.style.display = "none";
      this.els.quickOpts.style.display = "none"; 
      
      this.bindEvents();
      
      // 2. Inicia fluxo
      setTimeout(() => {
        this.transitionTo("start");
        if (!this.state.isOpen) this.els.badge.classList.add("pulse-active");
      }, 2000);
    }

    /* --- HELPERS --- */

    getRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    getRandomImage() {
        if (window.App && window.App.CONFIG && window.App.CONFIG.images) {
            // Usa a lista de imagens do app.js (ex: foto1.jpg, foto2.jpg...)
            return this.getRandom(window.App.CONFIG.images);
        }
        // Fallback robusto
        console.warn("App.CONFIG.images não encontrado. Usando fallback estático.");
        return "assets/foto1.jpg"; 
    }

    /* --- Navegação e Renderização --- */

    async transitionTo(nodeId) {
      const node = CONVERSATION_TREE[nodeId];
      if (!node) return;

      this.state.currentNode = nodeId;

      // 1. Limpa e desativa botões de nodes anteriores
      const previousOptions = this.els.msgs.querySelector(".current-options-block");
      if (previousOptions) {
        previousOptions.classList.remove("current-options-block");
        // Desabilita interação nos botões anteriores
        Array.from(previousOptions.querySelectorAll('button')).forEach(btn => btn.disabled = true);
      }
      
      // 2. Simula Digitação e Envio de Texto
      await this.processNodeMessages(node.text);

      // 3. Ações Especiais (Foto, Checkout)
      if (node.type === "action_photo") {
        const randomImage = this.getRandomImage();
        await this.sendPhoto(randomImage);
      } 
      else if (node.type === "action_checkout") {
        this.renderCheckoutButton();
        return; // Fim do fluxo padrão
      }

      // 4. Renderiza Próximas Opções
      if (node.options && node.options.length > 0) {
        this.renderOptions(node.options);
      }
    }

    async processNodeMessages(messages) {
      this.state.isTyping = true;

      for (const msg of messages) {
        const typing = document.createElement("div");
        typing.className = "typing-indicator";
        typing.innerHTML = "<span></span><span></span><span></span>";
        this.els.msgs.appendChild(typing);
        this.scrollToBottom();

        const typingTime = Math.max(800, msg.length * CONFIG.typingSpeed);
        await new Promise(r => setTimeout(r, typingTime));

        typing.remove();
        this.addBotMessage(msg);
        
        await new Promise(r => setTimeout(r, CONFIG.messageDelay));
      }

      this.state.isTyping = false;
    }

    renderOptions(options) {
      // NOVO: Renderiza as opções dentro de um container que segue o fluxo do chat
      const optionsBlock = document.createElement("div");
      optionsBlock.className = "message bot options-block current-options-block"; // Adicionado current-options-block
      const bubble = document.createElement("div");
      bubble.className = "bubble tree-options"; // Reutiliza estilo vertical

      options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "tree-btn fade-in";
        btn.innerText = opt.label;
        btn.onclick = (e) => {
          // Garante que o clique só ocorra se não estiver digitando
          if (!this.state.isTyping) { 
            this.addUserMessage(opt.label);
            this.transitionTo(opt.next);
          }
        };
        bubble.appendChild(btn);
      });
      
      optionsBlock.appendChild(bubble);
      this.els.msgs.appendChild(optionsBlock);
      this.scrollToBottom();
    }

    /* --- Componentes Visuais --- */

    addBotMessage(text) {
      const div = document.createElement("div");
      div.className = "message bot";
      div.innerHTML = `<div class="bubble">${text}</div>`;
      this.els.msgs.appendChild(div);
      this.scrollToBottom();
    }

    addUserMessage(text) {
      const div = document.createElement("div");
      div.className = "message user";
      div.innerHTML = `<div class="bubble">${text}</div>`;
      this.els.msgs.appendChild(div);
      this.scrollToBottom();
    }

    async sendPhoto(photoUrl) {
      // Simula upload
      const indicator = document.createElement("div");
      indicator.className = "upload-indicator";
      indicator.innerHTML = `<div class="progress-bar"><div class="fill"></div></div><small>Enviando mídia...</small>`;
      this.els.msgs.appendChild(indicator);
      this.scrollToBottom();

      await new Promise(r => setTimeout(r, 1500));
      indicator.remove();

      const div = document.createElement("div");
      div.className = "message bot";
      const wrap = document.createElement("div");
      wrap.className = "bubble photo-bubble";
      
      const img = document.createElement("img");
      img.src = "assets/" + photoUrl; // Usa o caminho base 'assets/' do app.js
      img.alt = "Preview";
      img.onclick = () => { 
          // O openLightbox deve ser chamado via App global, se existir
          if (window.App?.openLightbox) window.App.openLightbox("assets/" + photoUrl, "image"); 
      };
      
      wrap.appendChild(img);
      div.appendChild(wrap);
      this.els.msgs.appendChild(div);
      this.scrollToBottom();
    }

    renderCheckoutButton() {
      const wrap = document.createElement("div");
      wrap.className = "chat-cta-wrapper slide-up";
      wrap.innerHTML = `
        <a href="${CONFIG.paymentLink}" target="_blank" class="chat-main-btn pulse-btn">
            🔓 ACESSAR CONTEÚDO VIP AGORA
        </a>
        <div class="cta-sub">Acesso imediato e anônimo</div>
      `;
      this.els.msgs.appendChild(wrap);
      this.scrollToBottom();
    }

    scrollToBottom() {
      this.els.msgs.scrollTop = this.els.msgs.scrollHeight;
    }

    bindEvents() {
      const toggle = () => {
        this.state.isOpen = !this.state.isOpen;
        this.els.window.setAttribute("aria-hidden", !this.state.isOpen);
        if (this.els.toggleBtn) this.els.toggleBtn.style.display = this.state.isOpen ? "none" : "flex";
        
        if (this.state.isOpen) {
            this.els.badge.classList.remove("pulse-active");
            this.scrollToBottom();
        }
      };

      if (this.els.toggleBtn) this.els.toggleBtn.onclick = toggle;
      if (this.els.closeBtn) this.els.closeBtn.onclick = toggle;
    }
  }

  // Inicialização
  window.ChatEngine = new DecisionTreeEngine();
});
