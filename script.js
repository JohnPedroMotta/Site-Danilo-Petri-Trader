// ========================================
// GLOBAL CONSTANTS AND UTILITIES
// ========================================
const ANIMATION_DURATION = 300;
const SCROLL_OFFSET = 100;

// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// ========================================
// LOADING MANAGEMENT
// ========================================
class LoadingManager {
  constructor() {
    this.overlay = document.getElementById('loadingOverlay');
    this.init();
  }

  init() {
    // Hide loading overlay when page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => this.hide(), 500);
    });
  }

  show() {
    if (this.overlay) {
      this.overlay.classList.remove('hide');
    }
  }

  hide() {
    if (this.overlay) {
      this.overlay.classList.add('hide');
      setTimeout(() => {
        this.overlay.style.display = 'none';
      }, 500);
    }
  }
}

// ========================================
// HEADER MANAGEMENT
// ========================================
class HeaderManager {
  constructor() {
    this.header = document.getElementById('header');
    this.lastScrollY = window.scrollY;
    this.init();
  }

  init() {
    window.addEventListener('scroll', throttle(() => this.handleScroll(), 10));
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      this.header.style.background = 'rgba(10, 10, 10, 0.98)';
      this.header.style.backdropFilter = 'blur(20px)';
    } else {
      this.header.style.background = 'rgba(10, 10, 10, 0.95)';
      this.header.style.backdropFilter = 'blur(20px)';
    }

    this.lastScrollY = currentScrollY;
  }
}

// ========================================
// DROPDOWN MANAGEMENT
// ========================================
class DropdownManager {
  constructor() {
    this.dropdowns = document.querySelectorAll('.dropdown');
    this.activeDropdown = null;
    this.init();
  }

  init() {
    this.dropdowns.forEach(dropdown => {
      const button = dropdown.querySelector('.dropdown-btn');
      const content = dropdown.querySelector('.dropdown-content');
      
      if (button && content) {
        button.addEventListener('click', (e) => this.toggleDropdown(e, dropdown));
        
        // Keyboard navigation
        button.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleDropdown(e, dropdown);
          }
        });

        // Close on escape
        content.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.closeDropdown(dropdown);
            button.focus();
          }
        });
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        this.closeAllDropdowns();
      }
    });

    // Close dropdowns on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllDropdowns();
      }
    });
  }

  toggleDropdown(event, dropdown) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = dropdown.querySelector('.dropdown-btn');
    const content = dropdown.querySelector('.dropdown-content');
    const isOpen = content.classList.contains('show');
    
    // Close all other dropdowns
    this.closeAllDropdowns();
    
    if (!isOpen) {
      this.openDropdown(dropdown);
    }
  }

  openDropdown(dropdown) {
    const button = dropdown.querySelector('.dropdown-btn');
    const content = dropdown.querySelector('.dropdown-content');
    
    content.classList.add('show');
    button.setAttribute('aria-expanded', 'true');
    this.activeDropdown = dropdown;
    
    // Focus first menu item
    const firstMenuItem = content.querySelector('a');
    if (firstMenuItem) {
      setTimeout(() => firstMenuItem.focus(), 100);
    }
  }

  closeDropdown(dropdown) {
    const button = dropdown.querySelector('.dropdown-btn');
    const content = dropdown.querySelector('.dropdown-content');
    
    content.classList.remove('show');
    button.setAttribute('aria-expanded', 'false');
    
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
    }
  }

  closeAllDropdowns() {
    this.dropdowns.forEach(dropdown => {
      this.closeDropdown(dropdown);
    });
  }
}

// ========================================
// SMOOTH SCROLLING
// ========================================
class SmoothScroller {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('.scroll-link').forEach(link => {
      link.addEventListener('click', (e) => this.handleClick(e));
    });
  }

  handleClick(event) {
    event.preventDefault();
    
    const targetId = event.currentTarget.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      // Close any open dropdowns
      const dropdownManager = window.dropdownManager;
      if (dropdownManager) {
        dropdownManager.closeAllDropdowns();
      }
      
      // Calculate offset for fixed header
      const headerHeight = document.getElementById('header').offsetHeight;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Add highlight effect
      this.highlightElement(targetElement);
    }
  }

  highlightElement(element) {
    element.style.transition = 'box-shadow 0.3s ease';
    element.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.5)';
    
    setTimeout(() => {
      element.style.boxShadow = 'none';
      setTimeout(() => {
        element.style.transition = '';
      }, 300);
    }, 2000);
  }
}

// ========================================
// MODAL MANAGEMENT
// ========================================
class ModalManager {
  constructor() {
    this.modal = document.getElementById('productModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalContent = document.getElementById('modalContent');
    this.closeBtn = document.querySelector('.modal-close');
    this.overlay = document.querySelector('.modal-overlay');
    this.buyBtn = document.querySelector('.modal-buy-btn');
    this.productButtons = document.querySelectorAll('.product-btn');
    this.isOpen = false;
    this.focusableElements = null;
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    
    // Payment links for each product
    this.paymentLinks = {
      "gamma-indices": "https://pay.infinitepay.io/danilopetri_trader/VC1D-5wgZ9JkIvb-300,00",
      "gamma-cripto": "https://link.infinitepay.io/danilopetri_trader/VC1D-9zjvyg6L-299,99",
      "indicador-gamma": "https://pay.infinitepay.io/danilopetri_trader/VC1D-6qDIKOF6F-300,00",
      "imersao": "https://pay.hotmart.com/B99375401O",
      "mentoria": "https://pay.hotmart.com/H95976212G"
    };
    
    this.productContents = {
      "gamma-indices": {
        title: "Relatório Gamma - Índices",
        content: `
          <h3>📈 Informação Profissional ao Seu Alcance</h3>
          <p>Nosso Relatório de Posicionamento Gamma é um material profundo e detalhado, projetado para oferecer insights valiosos sobre o mercado. Ele traz um acompanhamento diário das posições dos market makers e de outros grandes players, em todas as classes de ativos.</p>
          
          <h3>📊 Dados Tratados por Especialistas:</h3>
          <ul>
            <li><strong>Posicionamento Gamma</strong> para os ativos SPX, Nasdaq e VIX</li>
            <li><strong>Principais Suportes e Resistências</strong> identificados para cada dia de negociação</li>
            <li><strong>Análises técnicas complementares</strong> baseadas em fluxo institucional</li>
          </ul>
          
          <h3>🎯 Para Day Trade e Position Trading:</h3>
          <p>Extraia o melhor dos dois mundos operacionais, com dados precisos que ajudam você a tomar decisões informadas e estratégicas em qualquer timeframe.</p>
          
          <h3>💎 Diferenciais:</h3>
          <ul>
            <li>Relatórios enviados diariamente antes da abertura do mercado</li>
            <li>Análise baseada em dados reais de posicionamento institucional</li>
            <li>Suporte técnico via Telegram para esclarecimentos</li>
            <li>Histórico de assertividade comprovada</li>
          </ul>
          
          <p><strong>Com esse relatório, você terá em mãos as mesmas informações utilizadas pelos maiores fundos de investimento, permitindo que você opere com a confiança de um profissional.</strong></p>
          
          <h3>📋 Instruções de Compra e Recebimento dos Relatórios:</h3>
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid var(--primary-gold);">
            <ol style="margin: 0; padding-left: 1.5rem;">
              <li><strong>Efetue o pagamento do produto</strong></li>
              <li><strong>Enviar comprovante pelo WhatsApp do Danilo</strong></li>
              <li><strong>Receber o produto</strong></li>
            </ol>
            <p style="margin-top: 1rem; font-style: italic; color: #d4af37;">Havendo dúvidas, entre em contato com a equipe</p>
          </div>
          
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1rem; border-radius: 8px; margin: 1.5rem 0;">
            <h3 style="color: #d4af37; margin-bottom: 0.5rem;">💰 Investimento:</h3>
            <p style="font-size: 1.2rem; margin: 0;"><strong>R$ 300,00 por trimestre</strong></p>
            <p style="font-size: 0.9rem; color: #aaa; margin: 0.5rem 0 0;">Trabalhamos apenas com assinaturas trimestrais para garantir consistência nos resultados.</p>
          </div>
        `
      },
      "gamma-cripto": {
        title: "Relatório Gamma - Cripto",
        content: `
          <h3>🚀 Informação Profissional para Criptomoedas</h3>
          <p>Nosso Relatório especializado em Criptomoedas e Commodities aplica a mesma metodologia gamma utilizada pelos grandes fundos, adaptada para os mercados de Bitcoin, Euro e Ouro.</p>
          
          <h3>📊 Dados Tratados por Especialistas:</h3>
          <ul>
            <li><strong>Posicionamento Gamma</strong> para Bitcoin, Euro e Ouro</li>
            <li><strong>Principais Suportes e Resistências</strong> para operações diárias</li>
            <li><strong>Análise de correlações</strong> entre os ativos monitorados</li>
            <li><strong>Fluxo institucional</strong> em tempo real</li>
          </ul>
          
          <h3>⚡ Para Day Trade e Position Trading:</h3>
          <p>Opere com segurança nos mercados mais voláteis, tendo sempre à disposição os níveis mais importantes calculados através da metodologia Gamma.</p>
          
          <h3>🎯 Mercados Cobertos:</h3>
          <ul>
            <li><strong>Bitcoin (BTC)</strong> - Principal criptomoeda mundial</li>
            <li><strong>Euro (EUR)</strong> - Moeda de referência global</li>
            <li><strong>Ouro (Gold)</strong> - Ativo de proteção tradicional</li>
          </ul>
          
          <h3>💎 Vantagens Exclusivas:</h3>
          <ul>
            <li>Relatórios específicos para mercados 24/7</li>
            <li>Análise adaptada à volatilidade cripto</li>
            <li>Correlações macro fundamentais</li>
            <li>Suporte especializado via Telegram</li>
          </ul>
          
          <h3>📋 Instruções de Compra e Recebimento dos Relatórios:</h3>
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid var(--primary-gold);">
            <ol style="margin: 0; padding-left: 1.5rem;">
              <li><strong>Efetue o pagamento do produto</strong></li>
              <li><strong>Enviar comprovante pelo WhatsApp do Danilo</strong></li>
              <li><strong>Receber o produto</strong></li>
            </ol>
            <p style="margin-top: 1rem; font-style: italic; color: #d4af37;">Havendo dúvidas, entre em contato com a equipe</p>
          </div>
          
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1rem; border-radius: 8px; margin: 1.5rem 0;">
            <h3 style="color: #d4af37; margin-bottom: 0.5rem;">💰 Investimento:</h3>
            <p style="font-size: 1.2rem; margin: 0;"><strong>R$ 300,00 por trimestre</strong></p>
            <p style="font-size: 0.9rem; color: #aaa; margin: 0.5rem 0 0;">Assinatura trimestral para máxima consistência nos resultados.</p>
          </div>
        `
      },
      "indicador-gamma": {
        title: "Indicador Gamma",
        content: `
          <h3>🛠️ Ferramenta Profissional de Trading</h3>
          <p>O Indicador Gamma é a ferramenta indispensável para qualquer trader que deseja um operacional vencedor. Ele identifica, de forma automática e precisa, as melhores regiões para tomada de risco, alinhando suas operações com os maiores players do mercado.</p>
          
          <h3>🎯 Para Traders Profissionais:</h3>
          <ul>
            <li>Maximize seus lucros com zonas de alvo identificadas com precisão</li>
            <li>Reduza drawdowns através de pontos de reversão calculados</li>
            <li>Opere alinhado com o fluxo institucional</li>
          </ul>
          
          <h3>📚 Para Traders Iniciantes:</h3>
          <ul>
            <li>Reduza os riscos operando nas zonas mais seguras</li>
            <li>Aprenda através de sinais visuais claros</li>
            <li>Desenvolva disciplina operacional</li>
          </ul>
          
          <h3>📈 Ativos Suportados:</h3>
          <ul>
            <li><strong>ES & MES</strong> - S&P 500 Futures</li>
            <li><strong>NQ & MNQ</strong> - Nasdaq Futures</li>
            <li><strong>GC & MGC</strong> - Gold Futures</li>
            <li><strong>MTB</strong> - Treasury Bond</li>
            <li><strong>CL & MCL</strong> - Crude Oil</li>
          </ul>
          
          <h3>💻 Plataformas Disponíveis:</h3>
          <ul>
            <li><strong>NinjaTrader</strong> - Versão completa com alertas</li>
            <li><strong>Bookmap</strong> - Integração com order flow</li>
          </ul>
          
          <h3>⚙️ Funcionalidades:</h3>
          <ul>
            <li>Identificação automática de zonas gamma</li>
            <li>Alertas sonoros e visuais</li>
            <li>Níveis de suporte e resistência dinâmicos</li>
            <li>Compatível com múltiplos timeframes</li>
          </ul>
          
          <h3>📋 Instruções de Instalação do Indicador:</h3>
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid var(--primary-gold);">
            <ol style="margin: 0; padding-left: 1.5rem;">
              <li><strong>Efetue o pagamento do produto</strong></li>
              <li><strong>Após pagamento enviar comprovante via WhatsApp</strong></li>
              <li><strong>Instalar o indicador seguindo o tutorial</strong></li>
            </ol>
            <p style="margin-top: 1rem; font-style: italic; color: #d4af37;">Havendo problemas na instalação ou dúvidas, entre em contato com a equipe</p>
          </div>
          
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1rem; border-radius: 8px; margin: 1.5rem 0;">
            <h3 style="color: #d4af37; margin-bottom: 0.5rem;">💰 Investimento:</h3>
            <p style="font-size: 1.2rem; margin: 0;"><strong>R$ 300,00 por trimestre</strong></p>
            <p style="font-size: 0.9rem; color: #aaa; margin: 0.5rem 0 0;">Equivalente a R$ 100,00 mensais - Licença trimestral.</p>
          </div>
        `
      },
      "imersao": {
        title: "Imersão 2.0",
        content: `
          <h3>🎓 O Curso Mais Completo do Mercado</h3>
          <p>Este não é mais um curso teórico - é um <strong>mapa estratégico</strong> para operar profissionalmente com os institucionais. Aprenda onde comprar, onde vender, quais zonas de reversão identificar e como calcular alvos mesmo antes do pregão iniciar.</p>
          
          <h3>🧠 O Que Você Vai Dominar:</h3>
          <p>Vamos direto ao ponto: você aprenderá a ler o <strong>Gamma Exposure (GEX)</strong>, a força oculta que define a volatilidade e a direção do mercado, especialmente com a explosão das opções 0DTE.</p>
          
          <h3>🛠️ Ferramentas Profissionais na Prática:</h3>
          <ul>
            <li><strong>SpotGamma</strong> - Plataforma premium de análise gamma</li>
            <li><strong>MenthorQ</strong> - Sistema avançado de opções</li>
            <li><strong>Bookmap</strong> - Leitura profissional de order flow</li>
          </ul>
          
          <h3>📋 Ementa Completa (15 Módulos):</h3>
          <ol>
            <li><strong>Gamma Profile</strong> - Fundamentos e aplicação prática</li>
            <li><strong>Interpretação de Ferramentas</strong> - SpotGamma e MenthorQ</li>
            <li><strong>Cenários Gamma Positivo</strong> - Como identificar e operar</li>
            <li><strong>Cenários Gamma Negativo</strong> - Estratégias específicas</li>
            <li><strong>Leitura do Hiro</strong> - Ferramenta exclusiva SpotGamma</li>
            <li><strong>Cálculo de Máximas e Mínimas</strong> - Metodologia própria</li>
            <li><strong>Bookmap Avançado</strong> - Order flow e tape reading</li>
            <li><strong>GexBot</strong> - Automação e alertas</li>
            <li><strong>Análise do VIX</strong> - Indicador de volatilidade</li>
            <li><strong>Skew Analysis</strong> - Assimetria de opções</li>
            <li><strong>Estrutura a Termo</strong> - Curva de volatilidade</li>
            <li><strong>Análise Pre-Market</strong> - Preparação diária</li>
            <li><strong>Gestão de Risco</strong> - Proteção de capital</li>
            <li><strong>Psicologia do Trading</strong> - Mentalidade vencedora</li>
            <li><strong>Casos Práticos</strong> - Operações reais comentadas</li>
          </ol>
          
          <h3>🎯 Metodologia de Ensino:</h3>
          <ul>
            <li><strong>100% Prático</strong> - Foco em aplicação real</li>
            <li><strong>Aulas Gravadas</strong> - Acesso vitalício na Hotmart</li>
            <li><strong>Suporte Direto</strong> - Telegram e WhatsApp com o mentor</li>
            <li><strong>Atualizações Gratuitas</strong> - Conteúdo sempre atual</li>
          </ul>
          
          <h3>📋 Instruções de Imersão 2.0:</h3>
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid var(--primary-gold);">
            <ol style="margin: 0; padding-left: 1.5rem;">
              <li><strong>Efetue o pagamento</strong></li>
              <li><strong>Após confirmação do pagamento via cartão ou pix o curso será liberado automaticamente</strong></li>
              <li><strong>Pagamento em boleto bancário serão liberados até 48h após processamento do pagamento</strong></li>
            </ol>
          </div>
          
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1rem; border-radius: 8px; margin: 1.5rem 0;">
            <h3 style="color: #d4af37; margin-bottom: 0.5rem;">💰 Investimento:</h3>
            <p style="font-size: 1.2rem; margin: 0;"><strong>R$ 1.000,00</strong></p>
            <p style="font-size: 0.9rem; color: #aaa; margin: 0.5rem 0 0;">Curso completo + Suporte direto com o mentor via Telegram/WhatsApp</p>
          </div>
        `
      },
      "mentoria": {
        title: "Mentoria Individual",
        content: `
          <h3>👨‍🏫 Programa Personalizado e Exclusivo</h3>
          <p>Chega de soluções genéricas. Sua jornada no mercado é única, seus desafios são específicos e sua curva de aprendizado precisa de uma atenção que nenhum curso em grupo pode oferecer.</p>
          
          <p><strong>A Mentoria Individual é um programa desenhado sob medida para você.</strong></p>
          
          <h3>🚀 Aceleração Máxima:</h3>
          <p>Juntos, vamos dissecar sua performance atual, identificar suas principais falhas e construir um plano operacional robusto e completo, partindo do zero até a profissionalização.</p>
          
          <ul>
            <li>Foco 100% nas suas necessidades específicas</li>
            <li>Seja no cálculo de opções, leitura de fluxo no Bookmap ou montagem de pré-market profissional</li>
            <li>Desenvolvimento de seu próprio sistema de trading</li>
          </ul>
          
          <h3>🎯 Visão 360° do Mercado:</h3>
          <p>Compilaremos toda a metodologia em um sistema coeso: análise macro, zonas de volume, exposição gamma e leitura de fluxo - <strong>o seu sistema personalizado</strong>.</p>
          
          <h3>📚 Conteúdo Programático Completo (16 Módulos):</h3>
          <ol>
            <li><strong>Fundamentos de Opções</strong> - Cálculos manuais e funcionamento</li>
            <li><strong>Metodologia Gamma</strong> - SpotGamma, MenthorQ, Sharketo</li>
            <li><strong>Gamma para Índices</strong> - Aplicação em mercados principais</li>
            <li><strong>Gamma para Commodities</strong> - Ouro e moedas</li>
            <li><strong>Gamma para Ações</strong> - Top 10 ações americanas</li>
            <li><strong>Análise Macro Global</strong> - Preparação pre-market</li>
            <li><strong>Correlações de Mercado</strong> - Juros, moedas, ouro, índices</li>
            <li><strong>Volume Profile Avançado</strong> - Análise institucional</li>
            <li><strong>Cenários Gamma</strong> - Positivo vs Negativo</li>
            <li><strong>Order Flow no Bookmap</strong> - Leitura profissional</li>
            <li><strong>Hiro e SpotGamma</strong> - Ferramentas premium</li>
            <li><strong>GexBot</strong> - Automação de análises</li>
            <li><strong>Plataformas Integradas</strong> - MenthorQ, SpotGamma, Sharketo</li>
            <li><strong>Níveis Gamma</strong> - Suportes e resistências</li>
            <li><strong>Automação com IA</strong> - Análises automatizadas</li>
            <li><strong>Setup Completo</strong> - NinjaTrader, Bookmap, TradingView</li>
          </ol>
          
          <h3>🎁 Bônus Exclusivos:</h3>
          <ul>
            <li><strong>3 Aulas Individuais 1x1</strong> com Danilo Petri</li>
            <li>Cada encontro: 1h a 1h30 de duração</li>
            <li>Intervalo mínimo de 4 dias entre encontros</li>
            <li>Prazo: até 6 meses pós-aquisição</li>
            <li>Suporte VIP via WhatsApp e Telegram</li>
          </ul>
          
          <h3>💎 Garantias:</h3>
          <ul>
            <li><strong>Suporte técnico ilimitado</strong> durante todo o programa</li>
            <li><strong>Acesso vitalício</strong> ao conteúdo</li>
            <li><strong>Atualizações gratuitas</strong> por 12 meses</li>
            <li><strong>Certificado de conclusão</strong></li>
          </ul>
          
          <h3>📋 Instruções de Mentoria Individual:</h3>
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid var(--primary-gold);">
            <ol style="margin: 0; padding-left: 1.5rem;">
              <li><strong>Efetue o pagamento</strong></li>
              <li><strong>Após confirmação do pagamento via cartão ou pix o curso será liberado automaticamente</strong></li>
              <li><strong>Pagamento em boleto bancário serão liberados até 48h após processamento do pagamento</strong></li>
            </ol>
          </div>
          
          <div style="background: linear-gradient(145deg, rgba(212, 175, 55, 0.15), rgba(255, 215, 0, 0.1)); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; border: 1px solid rgba(212, 175, 55, 0.3);">
            <h3 style="color: #ffd700; margin-bottom: 0.5rem;">👑 Investimento Premium:</h3>
            <p style="font-size: 1.4rem; margin: 0; font-weight: 700;"><strong>R$ 2.799,00</strong></p>
            <p style="font-size: 1rem; color: #d4af37; margin: 0.5rem 0 0;">Programa completo + 3 mentorias individuais 1x1</p>
          </div>
        `
      }
    };
    
    this.init();
  }

  init() {
    if (!this.modal) return;
    
    // Bind event listeners
    this.productButtons.forEach(button => {
      button.addEventListener('click', (e) => this.openModal(e));
    });
    
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.overlay.addEventListener('click', () => this.closeModal());
    this.buyBtn.addEventListener('click', () => this.handlePurchase());
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.closeModal();
      }
      
      if (this.isOpen && e.key === 'Tab') {
        this.handleTabKey(e);
      }
    });
  }

  openModal(event) {
    const productId = event.currentTarget.getAttribute('data-product');
    const product = this.productContents[productId];
    
    if (!product) return;
    
    this.modalTitle.textContent = product.title;
    this.modalContent.innerHTML = product.content;
    this.modal.classList.add('show');
    this.modal.style.display = 'flex';
    this.isOpen = true;
    
    // Store current product for purchase
    this.currentProduct = productId;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Set up focus management
    this.setupFocusManagement();
    
    // Focus the modal
    setTimeout(() => {
      if (this.firstFocusableElement) {
        this.firstFocusableElement.focus();
      }
    }, 100);
    
    // Analytics (if needed)
    this.trackModalOpen(productId);
  }

  closeModal() {
    this.modal.classList.remove('show');
    this.isOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    // Hide modal after animation
    setTimeout(() => {
      this.modal.style.display = 'none';
    }, ANIMATION_DURATION);
    
    // Return focus to trigger button
    const triggerButton = document.querySelector(`[data-product="${this.currentProduct}"]`);
    if (triggerButton) {
      triggerButton.focus();
    }
  }

  setupFocusManagement() {
    const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    this.focusableElements = this.modal.querySelectorAll(focusableElementsString);
    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }

  handleTabKey(event) {
    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        this.lastFocusableElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === this.lastFocusableElement) {
        this.firstFocusableElement.focus();
        event.preventDefault();
      }
    }
  }

  handlePurchase() {
    // Get the payment link for the current product
    const paymentLink = this.paymentLinks[this.currentProduct];
    
    if (paymentLink) {
      // Open payment link in new tab
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to WhatsApp if no payment link is found
      const productNames = {
        "gamma-indices": "Relatório Gamma - Índices",
        "gamma-cripto": "Relatório Gamma - Cripto", 
        "indicador-gamma": "Indicador Gamma",
        "imersao": "Imersão 2.0",
        "mentoria": "Mentoria Individual"
      };
      
      const productName = productNames[this.currentProduct];
      const message = `Olá! Tenho interesse no produto: ${productName}. Poderia me enviar mais informações sobre como adquirir?`;
      const whatsappURL = `https://wa.me/5511958300001?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappURL, '_blank', 'noopener,noreferrer');
    }
    
    // Track purchase intent
    this.trackPurchaseIntent(this.currentProduct);
    
    // Close modal
    this.closeModal();
  }

  trackModalOpen(productId) {
    // Analytics tracking - implement according to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'modal_open', {
        'product_id': productId,
        'event_category': 'engagement'
      });
    }
  }

  trackPurchaseIntent(productId) {
    // Analytics tracking for purchase intent
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase_intent', {
        'product_id': productId,
        'event_category': 'conversion'
      });
    }
  }
}

// ========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ========================================
class AnimationObserver {
  constructor() {
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, this.options);

      // Observe all animatable elements
      document.querySelectorAll('.feature-card, .product-card, .stat-item').forEach(el => {
        el.classList.add('animate-ready');
        this.observer.observe(el);
      });
    }
  }
}

// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // Lazy load images
    this.lazyLoadImages();
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize scroll performance
    this.optimizeScrollPerformance();
  }

  lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  preloadCriticalResources() {
    // Preload important fonts
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    fontPreload.as = 'style';
    document.head.appendChild(fontPreload);
  }

  optimizeScrollPerformance() {
    // Use passive listeners for better scroll performance
    let ticking = false;
    
    const updateScrollElements = () => {
      // Update any scroll-dependent elements here
      ticking = false;
    };
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollElements);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

// ========================================
// ERROR HANDLING
// ========================================
class ErrorHandler {
  constructor() {
    this.init();
  }

  init() {
    // Global error handling
    window.addEventListener('error', (event) => {
      console.error('JavaScript Error:', event.error);
      this.logError(event.error);
    });

    // Promise rejection handling
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      this.logError(event.reason);
    });
  }

  logError(error) {
    // Here you would typically send errors to your logging service
    // For now, we'll just log to console in development
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        'description': error.toString(),
        'fatal': false
      });
    }
  }
}

// ========================================
// MOBILE MENU (for future implementation)
// ========================================
class MobileMenu {
  constructor() {
    this.menuBtn = document.querySelector('.mobile-menu-btn');
    this.nav = document.querySelector('.nav');
    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.menuBtn) return;
    
    this.menuBtn.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.menuBtn.setAttribute('aria-expanded', this.isOpen);
    
    if (this.isOpen) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    // Mobile menu implementation
    console.log('Mobile menu opened');
  }

  close() {
    // Mobile menu implementation
    console.log('Mobile menu closed');
  }
}

// ========================================
// INITIALIZATION
// ========================================
class App {
  constructor() {
    this.components = {};
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      // Initialize all components
      this.components.loadingManager = new LoadingManager();
      this.components.headerManager = new HeaderManager();
      this.components.dropdownManager = new DropdownManager();
      this.components.smoothScroller = new SmoothScroller();
      this.components.modalManager = new ModalManager();
      this.components.animationObserver = new AnimationObserver();
      this.components.performanceOptimizer = new PerformanceOptimizer();
      this.components.errorHandler = new ErrorHandler();
      this.components.mobileMenu = new MobileMenu();
      
      // Make dropdown manager globally available
      window.dropdownManager = this.components.dropdownManager;
      
      console.log('✅ All components initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing components:', error);
    }
  }
}

// Start the application
const app = new App();