// MenuFrontend.js - Manejo de interfaz visual, animaciones y elementos UI
class MenuFrontend {
    constructor() {
        this.contentArea = document.getElementById('content-area');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.mainContent = document.getElementById('main-content');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupResponsiveMenu();
        this.showWelcomeMessage();
    }

    // === MANEJO DE EVENTOS DE NAVEGACIÓN ===
    setupEventListeners() {
        this.setupDropdownMenus();

        // Hamburger menu para móviles
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                this.closeAllDropdowns();
            }
        });
    }

    setupDropdownMenus() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const navLink = item.querySelector('.nav-link');
            const dropdown = item.querySelector('.dropdown');
            
            if (navLink && dropdown) {
                navLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleDropdown(item);
                });
            }
        });
    }

    // === ANIMACIONES Y EFECTOS VISUALES ===
    toggleDropdown(item) {
        const dropdown = item.querySelector('.dropdown');
        const isActive = item.classList.contains('active');
        
        // Cerrar todos los dropdowns con animación
        this.closeAllDropdowns();
        
        // Abrir el dropdown actual con animación
        if (!isActive && dropdown) {
            item.classList.add('active');
            dropdown.style.display = 'block';
            
            // Animación de entrada
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                dropdown.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                dropdown.style.opacity = '1';
                dropdown.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    closeAllDropdowns() {
        const activeItems = document.querySelectorAll('.nav-item.active');
        activeItems.forEach(item => {
            item.classList.remove('active');
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) {
                // Animación de salida
                dropdown.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                dropdown.style.opacity = '0';
                dropdown.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    dropdown.style.display = 'none';
                    dropdown.style.transition = '';
                }, 200);
            }
        });
    }

    // === RESPONSIVE DESIGN ===
    setupResponsiveMenu() {
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.navMenu.classList.remove('active');
                this.hamburger.classList.remove('active');
                this.closeAllDropdowns();
            }
        });
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.hamburger.classList.toggle('active');
        
        // Animación del botón hamburger
        if (this.hamburger.classList.contains('active')) {
            this.hamburger.style.transform = 'rotate(90deg)';
        } else {
            this.hamburger.style.transform = 'rotate(0deg)';
        }
    }

    // === EFECTOS DE CARGA ===
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
            this.loadingOverlay.style.opacity = '0';
            
            setTimeout(() => {
                this.loadingOverlay.style.transition = 'opacity 0.3s ease';
                this.loadingOverlay.style.opacity = '1';
            }, 10);
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.transition = 'opacity 0.3s ease';
            this.loadingOverlay.style.opacity = '0';
            
            setTimeout(() => {
                this.loadingOverlay.style.display = 'none';
            }, 300);
        }
    }

    // === RENDERIZADO DE CONTENIDO ===
    loadContent(content) {
        if (this.contentArea) {
            // Animación de salida del contenido anterior
            this.contentArea.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            this.contentArea.style.opacity = '0';
            this.contentArea.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                this.contentArea.innerHTML = content;
                
                // Animación de entrada del nuevo contenido
                this.contentArea.style.opacity = '1';
                this.contentArea.style.transform = 'translateY(0)';
            }, 200);
        }
    }

    showWelcomeMessage() {
        const welcomeHTML = `
            <div class="welcome-section" style="animation: fadeInUp 0.6s ease;">
                <h1 style="animation: fadeInDown 0.8s ease;">Bienvenido al Sistema de Ventas</h1>
                <p style="opacity: 0; animation: fadeIn 1s ease 0.3s forwards;">Selecciona una opción del menú para comenzar</p>
                <div class="system-info" style="opacity: 0; animation: fadeInUp 0.8s ease 0.5s forwards;">
                    <div class="info-card" style="animation: slideInLeft 0.6s ease 0.7s backwards;">
                        <h3>Gestión Completa</h3>
                        <p>Administra usuarios, productos, clientes y categorías</p>
                    </div>
                    <div class="info-card" style="animation: slideInUp 0.6s ease 0.9s backwards;">
                        <h3>Facturación</h3>
                        <p>Realiza ventas y gestiona facturas de manera eficiente</p>
                    </div>
                    <div class="info-card" style="animation: slideInRight 0.6s ease 1.1s backwards;">
                        <h3>Reportes</h3>
                        <p>Genera reportes detallados de tu negocio</p>
                    </div>
                </div>
            </div>
        `;
        
        this.loadContent(welcomeHTML);
        this.addWelcomeAnimationStyles();
    }

    addWelcomeAnimationStyles() {
        // Agregar estilos de animación si no existen
        if (!document.getElementById('welcome-animations')) {
            const style = document.createElement('style');
            style.id = 'welcome-animations';
            style.textContent = `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // === EFECTOS VISUALES PARA MÓDULOS ===
    showModuleWithEffect(content) {
        this.loadContent(content);
        
        // Agregar efecto de entrada a los módulos
        setTimeout(() => {
            const moduleContainer = document.querySelector('.module-container');
            if (moduleContainer) {
                moduleContainer.style.animation = 'slideInUp 0.5s ease';
            }
        }, 250);
    }

    showReportWithEffect(content) {
        this.loadContent(content);
        
        // Agregar efecto especial para reportes
        setTimeout(() => {
            const reportContainer = document.querySelector('.report-container');
            if (reportContainer) {
                reportContainer.style.animation = 'fadeInUp 0.6s ease';
                
                // Animar tabla si existe
                const reportTable = document.querySelector('.report-table');
                if (reportTable) {
                    const rows = reportTable.querySelectorAll('tbody tr');
                    rows.forEach((row, index) => {
                        row.style.opacity = '0';
                        row.style.animation = `fadeInUp 0.4s ease ${index * 0.1 + 0.3}s forwards`;
                    });
                }
            }
        }, 250);
    }

    // === NOTIFICACIONES Y ALERTS VISUALES ===
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-remove después de 5 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // === EFECTOS HOVER Y INTERACTIVIDAD ===
    addInteractiveEffects() {
        // Agregar efectos hover a botones
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                this.style.transition = 'all 0.2s ease';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        });
    }

    // === TEMA Y ESTILOS DINÁMICOS ===
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        // Guardar preferencia
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Animación de transición de tema
        document.body.style.transition = 'all 0.3s ease';
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    // === UTILIDADES VISUALES ===
    highlightElement(element, duration = 2000) {
        if (element) {
            element.style.background = 'rgba(255, 235, 59, 0.3)';
            element.style.transition = 'background 0.3s ease';
            
            setTimeout(() => {
                element.style.background = '';
            }, duration);
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // === MÉTODOS PÚBLICOS PARA INTERACCIÓN ===
    showAlert(message) {
        alert(message);
    }

    showConfirm(message) {
        return confirm(message);
    }
}