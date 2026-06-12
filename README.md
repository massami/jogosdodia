# ⚽ Copa do Mundo FIFA 2026 - Widget de Resultados Ao Vivo

Um widget web minimalista, responsivo e autônomo projetado com **250px de largura** para ser fixado no canto da tela do computador (ou em barras laterais) para acompanhar os jogos e resultados do dia atual da Copa do Mundo 2026 em tempo real.

![Preview da Interface](https://raw.githubusercontent.com/massami/jogosdodia/main/preview.png) *(Substitua pela imagem do preview se desejar)*

---

## ✨ Recursos Principais

* 🖥️ **Design Compacto (250px)**: Interface otimizada com estética premium em dark mode e elementos de glassmorphism, perfeita para deixar aberta no canto do monitor.
* 🔄 **Atualização Minuto a Minuto**: Motor assíncrono que atualiza o relógio do widget, os contadores regressivos para os jogos e os eventos das partidas minuto a minuto de forma automática.
* 📡 **Dados Reais via API**: Integração direta com a API pública da Copa de 2026 (`https://worldcup26.ir`) para buscar placares, marcadores de gols, status das partidas e tempo decorrido.
* 🛡️ **Resiliência com Fallback Local**: Caso a API fique offline ou ocorra bloqueio de CORS no navegador, o widget aciona uma base de dados local offline pré-configurada baseada na tabela oficial.
* 🎮 **Modo Simulação Interativo**: Um botão de alternância no rodapé que permite simular um jogo ao vivo (Canadá vs Bósnia) acontecendo em tempo real acelerado para testar e ver as atualizações estéticas acontecendo.
* 📊 **Detalhes Expandidos**: Ao clicar em qualquer cartão de jogo, um painel é revelado contendo:
  * Lista de goleadores do jogo.
  * Estatísticas ao vivo (Posse de bola e Finalizações em barras gráficas).
  * Linha do tempo (comentários rápidos com os principais lances da partida).
* 🇧🇷 **Fuso Horário Local**: Converte automaticamente o horário dos jogos (locais dos estádios) para o horário do seu sistema operacional.
* 🎏 **Bandeiras Customizadas em SVG**: Renderiza ícones vetoriais leves das bandeiras nacionais de forma nativa e sem depender de requisições externas de imagens.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído usando tecnologias web fundamentais para máxima leveza, portabilidade e performance instantânea:
* **HTML5**: Estrutura semântica e organizada.
* **Vanilla CSS (CSS3)**: Sistema de design customizado com variáveis CSS, blur de fundo, animações keyframe de pulsação e flexbox.
* **Pure JavaScript (ES6+)**: Consumo de API rest, gerenciador de estado das partidas, temporizadores assíncronos e motor de simulação.
* **Google Fonts**: Tipografia moderna usando a fonte *Outfit*.

---

## 🚀 Como Executar Localmente

Como o projeto é estático e livre de dependências ou build complexos, rodá-lo é extremamente simples:

1. **Baixe ou clone o repositório**:
   ```bash
   git clone https://github.com/massami/jogosdodia.git
   ```
2. **Abra o site**:
   * Basta dar dois cliques no arquivo `index.html` para abri-lo diretamente no seu navegador.
   * *Opcional*: Se preferir rodar em um servidor web de desenvolvimento, você pode utilizar:
     ```bash
     npx live-server
     # ou
     python -m http.server 8000
     ```

---

## ☁️ Como Hospedar Gratuitamente

### Via GitHub Pages (Recomendado)
Este repositório já está pronto para o GitHub Pages. Para ativar:
1. Vá até as **Settings** (Configurações) deste repositório no GitHub.
2. Na barra lateral, selecione **Pages**.
3. Em *Build and deployment*, defina a branch como `main` e a pasta como `/ (root)`.
4. Clique em **Save**. Seu link público estará ativo em instantes!

---

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT. Sinta-se livre para usar, modificar e distribuir.
