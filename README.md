# 💜 Pacote de Conteúdo Exclusivo - xprincesswhore

Esta é a página de destino (Landing Page) para venda de um pacote de conteúdo exclusivo. A arquitetura é focada em performance, escalabilidade e uma excelente Experiência do Usuário (UX/CX), com um carrossel funcional e uma jornada de compra clara.

## 🛠️ Tecnologias

* **HTML5:** Estrutura semântica.
* **CSS3:** Estilização moderna e responsiva (`styles.css`).
* **Vanilla JavaScript:** Lógica de Carrossel (Carousel), Modais (Pop-ups) e Interação. **(Lógica Zero-Bug aplicada)**
* **Font Awesome:** Ícones.

## 🚀 Estrutura do Projeto

| Arquivo | Função Principal | Notas de Arquitetura |
| :--- | :--- | :--- |
| `index.html` | Estrutura da Página | Contém Header, Seção de Conteúdo (Carrossel/Detalhes), Modais e Footer. |
| `styles.css` | Estilização/Design | Responsividade (`@media queries`) e variáveis CSS. |
| `app.js` | Lógica de Interatividade | Controla a navegação do carrossel, a randomização da prévia e a exibição dos modais. |
| `assets/` | Mídias | Pasta onde **todos os arquivos** (`.jpg`, `.mp4`) devem ser armazenados. |

## ⚙️ Configuração Rápida

Para colocar o projeto no ar, você precisa apenas ajustar os seguintes pontos no `app.js`:

1.  **Link de Pagamento:**
    * Altere o valor da constante `PAYMENT_LINK` com seu link de destino.
    ```javascript
    const PAYMENT_LINK = "[https://go.perfectpay.com.br/PPU38CQ3I44](https://go.perfectpay.com.br/PPU38CQ3I44)"; 
    ```
2.  **Arquivos de Mídia:**
    * Mantenha a lista `mediaFiles` atualizada com os nomes exatos dos arquivos dentro da pasta `assets/`.
    ```javascript
    const mediaFiles = [
      "20251014_052443.jpg",
      "1.mp4",
      // ... adicione mais nomes aqui
    ];
    ```

## ✨ Funcionalidades Específicas (UX/CX)

* **Carrossel de Prévia:** Reprodução automática/loop, com controle de pausa no hover e navegação por setas/indicadores.
* **Zero-Bug em Vídeos:** Gerenciamento da reprodução de vídeo (`pause()/currentTime=0`) para evitar conflitos e uso excessivo de recursos.
* **Prévia Rápida Aleatória:** O botão "Assistir prévia" carrega uma mídia **aleatória** da lista, aumentando o engajamento e destacando a diversidade do conteúdo.
* **Modal Otimizado:** O pop-up de compra foi simplificado para conter apenas o botão "Ir para Pagamento" e um botão "X" para fechar, reduzindo a fricção na conversão.
