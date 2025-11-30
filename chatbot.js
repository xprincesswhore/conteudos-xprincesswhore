document.addEventListener("DOMContentLoaded", () => {
  const CHAT_CONFIG = {
    // 🔴 PEGUE SUA CHAVE GRÁTIS EM: https://console.groq.com/keys
    apiKey: "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", 
    
    paymentLink: "https://go.invictuspay.app.br/uiu36mqyaf",
    typingSpeed: 0, // Groq é instantânea
    autoOpenDelay: 6000
  };

  class Chatbot {
    constructor() {
      this.els = {
        widget: document.getElementById('chatbot'),
        toggle: document.getElementById('chatToggle'),
        window: document.querySelector('.chat-window'),
        close: document.querySelector('.close-chat'),
        input: document.getElementById('chatInput'),
        send: document.getElementById('chatSend'),
        msgs: document.getElementById('chatMessages'),
        quickOpts: document.getElementById('quickOptions'),
        badge: document.querySelector('.notification-dot')
      };

      if (!this.els.widget) return;

      this.isOpen = false;
      this.isTyping = false;
      
      // Histórico inicial (System Prompt OTIMIZADO para Llama 3)
      this.history = [
        {
          role: "system",
          content: `Você é uma personagem fictícia chamada xprincesswhore em um RPG de chat.
          CONTEXTO: Você é uma 'hotwife' que vende conteúdo adulto.
          PERSONALIDADE: Provocante, ousada, gosta de humilhar levemente homens 'fracos' e adora homens 'dotados' (BBC).
          OBJETIVO: Flertar intensamente e convencer o usuário a comprar o acesso VIP por R$ 20.
          REGRAS RÍGIDAS:
          1. Respostas CURTAS (máximo 2 frases).
          2. Não seja puritana. Use linguagem sugestiva e picante.
          3. Se perguntarem preço: R$ 20.
          4. Se perguntarem pagamento: PIX ou Cartão (fatura discreta).`
        },
        {
          role: "assistant",
          content: "Oiê... to sozinha em casa. 😈 Quer ver o que eu faço escondida?"
        }
      ];
      
      this.init();
    }

    init() {
      this.bindEvents();
      setTimeout(() => {
        if (!this.isOpen) {
          this.els.badge.classList.add('pulse-active');
        }
      }, CHAT_CONFIG.autoOpenDelay);
    }

    // --- CÉREBRO GROQ (LLAMA 3) ---
    async getSmartResponse(input) {
      const text = input.toLowerCase();

      // 1. INTERCEPTADOR DE VENDAS (Garante o link)
      if (text.match(/(preço|valor|custa|dinheiro|quanto|desconto|comprar|link|pagar|pix)/)) {
        return "Tá de graça hoje, bebê: só **R$ 20,00**. 😈 Paga logo pra eu te mostrar tudo o que meu marido não vê. <br><br><a href='" + CHAT_CONFIG.paymentLink + "' target='_blank' class='chat-button'>QUERO ACESSO VIP</a>";
      }

      // Validação da Key
      if (CHAT_CONFIG.apiKey.startsWith("gsk_COLE")) {
        return "Erro: Você esqueceu de colocar a API Key da Groq no código! 😬";
      }

      try {
        // Adiciona msg do usuário
        this.history.push({ role: "user", content: input });

        // Chamada API Groq
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CHAT_CONFIG.apiKey}`
          },
          body: JSON.stringify({
            messages: this.history,
            model: "llama3-70b-8192", // Modelo inteligente e permissivo
            temperature: 0.8,        // Criatividade alta
            max_tokens: 150,
            top_p: 1,
            stream: false,
            stop: null
          })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);
        
        let botReply = data.choices[0].message.content;
        
        // Remove aspas extras se a IA colocar
        botReply = botReply.replace(/^["']|["']$/g, '');

        // Adiciona resposta da IA ao histórico
        this.history.push({ role: "assistant", content: botReply });
        
        return botReply;

      } catch (error) {
        console.error("Erro na Groq:", error);
        // Fallback robusto se a API falhar
        return "Adoro quando você fala assim... 🔥 Clica no botão aqui embaixo pra gente continuar isso na área VIP.";
      }
    }

    toggleChat(forceState = null) {
      this.isOpen = forceState !== null ? forceState : !this.isOpen;
      this.els.window.setAttribute('aria-hidden', !this.isOpen);
      
      if (this.isOpen) {
        this.els.input.focus();
        this.els.badge.classList.remove('pulse-active');
        this.els.badge.style.display = 'none';
      }
    }

    appendMessage(text, sender) {
      const div = document.createElement('div');
      div.className = `message ${sender}`;
      div.innerHTML = `<div class="bubble">${text}</div>`;
      this.els.msgs.insertBefore(div, this.els.quickOpts);
      this.els.msgs.scrollTop = this.els.msgs.scrollHeight;
    }

    showTyping() {
      const div = document.createElement('div');
      div.className = 'typing-indicator';
      div.id = 'typing';
      div.innerHTML = '<span></span><span></span><span></span>';
      this.els.msgs.insertBefore(div, this.els.quickOpts);
      this.els.msgs.scrollTop = this.els.msgs.scrollHeight;
      return div;
    }

    async processUserMessage(text) {
      if(!text.trim() || this.isTyping) return;

      this.appendMessage(text, 'user');
      this.els.input.value = '';
      this.isTyping = true;

      const typingEl = this.showTyping();

      const response = await this.getSmartResponse(text);
      
      typingEl.remove();
      this.appendMessage(response, 'bot');
      this.isTyping = false;
    }

    bindEvents() {
        this.els.toggle.addEventListener('click', () => this.toggleChat());
        this.els.close.addEventListener('click', () => this.toggleChat(false));
        
        this.els.send.addEventListener('click', () => {
            this.processUserMessage(this.els.input.value);
        });

        this.els.input.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') this.processUserMessage(this.els.input.value);
        });

        this.els.quickOpts.addEventListener('click', (e) => {
            if(e.target.classList.contains('opt-btn')) {
                this.processUserMessage(e.target.dataset.msg);
            }
        });
    }
  }

  new Chatbot();
});
