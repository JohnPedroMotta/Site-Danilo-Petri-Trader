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
          <div class="modal-section">
            <h3>📈 Informação Profissional ao Seu Alcance</h3>
            <p>Nosso Relatório de Posicionamento Gamma é um material profundo e detalhado, projetado para oferecer insights valiosos sobre o mercado. Ele traz um acompanhamento diário das posições dos market makers e de outros grandes players, em todas as classes de ativos.</p>
          </div>
          <div class="modal-section">
            <h3>📊 Dados Tratados por Especialistas:</h3>
            <ul>
              <li><strong>Posicionamento Gamma</strong> para os ativos SPX, Nasdaq e VIX</li>
              <li><strong>Principais Suportes e Resistências</strong> identificados para cada dia de negociação</li>
              <li><strong>Análises técnicas complementares</strong> baseadas em fluxo institucional</li>
            </ul>
          </div>
          <div class="modal-section">
            <h3>🎯 Para Day Trade e Position Trading:</h3>
            <p>Extraia o melhor dos dois mundos operacionais, com dados precisos que ajudam você a tomar decisões informadas e estratégicas em qualquer timeframe.</p>
          </div>
          <div class="modal-section">
            <h3>💎 Diferenciais:</h3>
            <ul>
              <li>Relatórios enviados diariamente antes da abertura do mercado</li>
              <li>Análise baseada em dados reais de posicionamento institucional</li>
              <li>Suporte técnico via Telegram para esclarecimentos</li>
              <li>Histórico de assertividade comprovada</li>
            </ul>
            <p><strong>Com esse relatório, você terá em mãos as mesmas informações utilizadas pelos maiores fundos de investimento, permitindo que você opere com a confiança de um profissional.</strong></p>
          </div>
          <div class="modal-info-box">
            <h3>📋 Instruções de Compra e Recebimento dos Relatórios:</h3>
            <ol>
              <li><strong>Efetue o pagamento do produto</strong></li>
              <li><strong>Enviar comprovante pelo WhatsApp do Danilo</strong></li>
              <li><strong>Receber o produto</strong></li>
            </ol>
            <p>Havendo dúvidas, entre em contato com a equipe</p>
          </div>
          <div class="modal-price-box">
            <h3>💰 Investimento:</h3>
            <p class="price-value"><strong>R$ 300,00 por trimestre</strong></p>
            <p class="price-period">Trabalhamos apenas com assinaturas trimestrais para garantir consistência nos resultados.</p>
          </div>
        `
      },
      "gamma-cripto": {
        title: "Relatório Gamma - Cripto",
        content: `
          <div class="modal-section">
            <h3>🚀 Informação Profissional para Criptomoedas</h3>
            <p>Nosso Relatório especializado em Criptomoedas e Commodities aplica a mesma metodologia gamma utilizada pelos grandes fundos, adaptada para os mercados de Bitcoin, Euro e Ouro.</p>
          </div>
          <div class="modal-section">
            <h3>📊 Dados Tratados por Especialistas:</h3>
            <ul>
              <li><strong>Posicionamento Gamma</strong> para Bitcoin, Euro e Ouro</li>
              <li><strong>Principais Suportes e Resistências</strong> para operações diárias</li>
              <li><strong>Análise de correlações</strong> entre os ativos monitorados</li>
              <li><strong>Fluxo institucional</strong> em tempo real</li>
            </ul>
          </div>
          <div class="modal-section">
            <h3>⚡ Para Day Trade e Position Trading:</h3>
            <p>Opere com segurança nos mercados mais voláteis, tendo sempre à disposição os níveis mais importantes calculados através da metodologia Gamma.</p>
          </div>
          <div class="modal-section">
            <h3>🎯 Mercados Cobertos:</h3>
            <ul>
              <li><strong>Bitcoin (BTC)</strong> - Principal criptomoeda mundial</li>
              <li><strong>Euro (EUR)</strong> - Moeda de referência global</li>
              <li><strong>Ouro (Gold)</strong> - Ativo de proteção tradicional</li>
            </ul>
          </div>
          <div class="modal-info-box">
            <h3>📋 Instruções de Compra e Recebimento dos Relatórios:</h3>
            <ol>
              <li><strong>Efetue o pagamento do produto</strong></li>
              <li><strong>Enviar comprovante pelo WhatsApp do Danilo</strong></li>
              <li><strong>Receber o produto</strong></li>
            </ol>
            <p>Havendo dúvidas, entre em contato com a equipe</p>
          </div>
          <div class="modal-price-box">
            <h3>💰 Investimento:</h3>
            <p class="price-value"><strong>R$ 300,00 por trimestre</strong></p>
            <p class="price-period">Assinatura trimestral para máxima consistência nos resultados.</p>
          </div>
        `
      },
      "indicador-gamma": {
        title: "Indicador Gamma",
        content: `
          <div class="modal-section">
            <h3>🛠️ Ferramenta Profissional de Trading</h3>
            <p>O Indicador Gamma é a ferramenta indispensável para qualquer trader que deseja um operacional vencedor. Ele identifica, de forma automática e precisa, as melhores regiões para tomada de risco, alinhando suas operações com os maiores players do mercado.</p>
          </div>
          <div class="modal-section">
            <h3>🎯 Para Traders Profissionais:</h3>
            <ul>
              <li>Maximize seus lucros com zonas de alvo identificadas com precisão</li>
              <li>Reduza drawdowns através de pontos de reversão calculados</li>
              <li>Opere alinhado com o fluxo institucional</li>
            </ul>
          </div>
          <div class="modal-section">
            <h3>📚 Para Traders Iniciantes:</h3>
            <ul>
              <li>Reduza os riscos operando nas zonas mais seguras</li>
              <li>Aprenda através de sinais visuais claros</li>
              <li>Desenvolva disciplina operacional</li>
            </ul>
          </div>
          <div class="modal-section">
            <h3>📈 Ativos Suportados:</h3>
            <ul>
              <li><strong>ES & MES</strong> - S&P 500 Futures</li>
              <li><strong>NQ & MNQ</strong> - Nasdaq Futures</li>
              <li><strong>GC & MGC</strong> - Gold Futures</li>
              <li><strong>MTB</strong> - Treasury Bond</li>
              <li><strong>CL & MCL</strong> - Crude Oil</li>
            </ul>
          </div>
          <div class="modal-section">
            <h3>💻 Plataformas Disponíveis:</h3>
            <ul>
              <li><strong>NinjaTrader</strong> - Versão completa com alertas</li>
              <li><strong>Bookmap</strong> - Integração com order flow</li>
            </ul>
          </div>
          <div class="modal-info-box">
            <h3>📋 Instruções de Instalação do Indicador:</h3>
            <ol>
              <li><strong>Efetue o pagamento do produto</strong></li>
              <li><strong>Baixe os arquivos</strong> do produto e extraia-os</li>
              <li><strong>Siga o passo a passo de instalação</strong> contido no arquivo de instruções</li>
              <li><strong>Caso tenha dificuldade</strong> na instalação, entre em contato com a equipe de suporte através do WhatsApp do Danilo</li>
            </ol>
            <p>Havendo dúvidas, entre em contato com a equipe</p>
          </div>
          <div class="modal-price-box">
            <h3>💰 Investimento:</h3>
            <p class="price-value"><strong>R$ 300,00 por trimestre</strong></p>
            <p class="price-period">Assinatura trimestral para garantir consistência nos resultados.</p>
          </div>
        `
      },
      "imersao": {
        title: "Imersão 2.0",
        content: `
          <div class="modal-section">
            <h3>🎓 Curso Completo para Trader Profissional</h3>
            <p>A imersão 2.0 é um curso completo e prático, projetado para capacitar traders a operar com a mesma mentalidade e ferramentas que os grandes players institucionais utilizam.</p>
          </div>
          <div class="modal-section">
            <h3>📚 Módulos do Curso:</h3>
            <ol>
              <li>Introdução à Análise Gamma: Fundamentos e importância</li>
              <li>Leitura de Gamma Exposure (GEX) e Vanna/Charm</li>
              <li>SpotGamma & MenthorQ: Uso profissional das plataformas</li>
              <li>Estratégias Operacionais: Scalping, Day Trade e Position Trading</li>
              <li>Análise de Fluxo e Volume: Como combinar com a análise Gamma</li>
              <li>Gestão de Risco e Capital: O segredo dos profissionais</li>
              <li>Ferramentas: Bookmap e outros softwares essenciais</li>
              <li>Psicologia do Trading: Controle emocional e disciplina</li>
              <li>Operando na Prática: Estudos de caso e análises ao vivo</li>
              <li>Mercados Avançados: Cripto, commodities e Forex</li>
              <li>Revisão e Aprimoramento: Sessões de Q&A</li>
              <li>Plano de Trading Pessoal: Desenvolva o seu plano</li>
              <li>Backtesting e Otimização de Estratégias</li>
              <li>Rotina de um Trader Profissional</li>
              <li>Sessão de Mentoria em Grupo</li>
            </ol>
          </div>
          <div class="modal-section">
            <h3>📊 O Que Você Receberá:</h3>
            <ul>
              <li>Acesso vitalício à plataforma de membros</li>
              <li>15 módulos de vídeo aulas de alta qualidade</li>
              <li>Material de apoio em PDF</li>
              <li>Comunidade exclusiva no Telegram</li>
              <li>Aulas de tira-dúvidas ao vivo e gravadas</li>
              <li>Acesso às atualizações futuras do curso</li>
            </ul>
          </div>
          <div class="modal-section">
            <h3>🚀 Para Quem é a Imersão:</h3>
            <p>Ideal para traders que já operam mas buscam consistência, ou para iniciantes que desejam começar da forma correta, alinhados com o mercado institucional.</p>
          </div>
          <div class="modal-info-box">
            <h3>✨ Acesso Exclusivo:</h3>
            <p><strong>Após a compra, você receberá o acesso à Hotmart e às instruções para entrar na comunidade de alunos.</strong></p>
          </div>
          <div class="modal-price-box">
            <h3>💰 Investimento:</h3>
            <p class="price-value"><strong>R$ 1.000,00</strong></p>
            <p class="price-period">Pagamento único e acesso vitalício.</p>
          </div>
        `
      },
      "mentoria": {
        title: "Mentoria Individual",
        content: `
          <div class="modal-section">
            <h3>🎯 Programa Personalizado de Desenvolvimento</h3>
            <p>A Mentoria Individual é o caminho mais rápido para a consistência e o profissionalismo no trading. Desenvolvida e ministrada pessoalmente, este programa foca nas suas necessidades e desafios específicos, garantindo um plano de trading sob medida.</p>
          </div>
          <div class="modal-section">
            <h3>✔️ O Que Inclui:</h3>
            <ul>
              <li><strong>Plano Operacional Exclusivo:</strong> Criado para o seu perfil e objetivos.</li>
              <li><strong>16 Módulos do Curso Imersão 2.0:</strong> Acesso completo e vitalício ao conteúdo teórico.</li>
              <li><strong>3 Aulas Individuais (1x1):</strong> Sessões focadas nos seus pontos fracos e na otimização da sua estratégia.</li>
              <li><strong>Análise de Performance:</strong> Análise detalhada do seu desempenho e plano de melhoria contínua.</li>
              <li><strong>Suporte Direto e Prioritário:</strong> Tenha acesso exclusivo para tirar suas dúvidas sempre que precisar.</li>
            </ul>
          </div>
          <div class="modal-section">
            <h3>🚀 Benefícios Chave:</h3>
            <ul>
              <li>Acelere a sua curva de aprendizado.</li>
              <li>Superar desafios de forma direcionada.</li>
              <li>Desenvolver a disciplina e a mentalidade de um trader de sucesso.</li>
              <li>Ter um mentor experiente ao seu lado em todas as etapas.</li>
            </ul>
          </div>
          <div class="modal-info-box">
            <h3>✨ Um Passo à Frente:</h3>
            <p><strong>Este programa é a sua oportunidade de ter um acompanhamento de perto para alcançar a excelência no mercado.</strong></p>
          </div>
          <div class="modal-price-box">
            <h3>💰 Investimento:</h3>
            <p class="price-value"><strong>R$ 2.799,00</strong></p>
            <p class="price-period">Valor total do programa completo.</p>
          </div>
        `
      }
    };

    this.init();
  }

  init() {
    this.productButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const product = button.dataset.product;
        this.openModal(product);
      });
    });

    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.overlay.addEventListener('click', () => this.closeModal());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    // Handle buy button click
    if (this.buyBtn) {
      this.buyBtn.addEventListener('click', (e) => this.handleBuyClick(e));
    }
    
    // Accessibility: Trap focus within the modal
    this.modal.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' && this.modal.classList.contains('show')) {
            this.trapFocus();
        }
    });
  }

  openModal(product) {
    if (!this.isOpen) {
      const content = this.productContents[product];
      const link = this.paymentLinks[product];

      if (content) {
        this.modalTitle.textContent = content.title;
        this.modalContent.innerHTML = content.content;
        this.buyBtn.href = link;
        
        this.modal.classList.add('show');
        this.modal.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      }
    }
  }

  closeModal() {
    if (this.isOpen) {
      this.modal.classList.remove('show');
      this.modal.setAttribute('aria-hidden', 'true');
      this.isOpen = false;
      
      // Allow body scroll
      document.body.style.overflow = '';
      
      // Return focus to the button that opened the modal
      this.lastFocusElement.focus();
    }
  }
  
  // Accessibility: Trap focus inside modal
  trapFocus() {
    this.focusableElements = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];

    if (this.firstFocusableElement) {
        this.firstFocusableElement.focus();
    }
    
    this.modal.addEventListener('keydown', this.handleKeydown.bind(this));
  }
  
  handleKeydown(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === this.firstFocusableElement) {
          this.lastFocusableElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === this.lastFocusableElement) {
          this.firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    }
  }
  
  handleBuyClick(e) {
      // Logic for handling the buy button click
      console.log('Buy button clicked');
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
