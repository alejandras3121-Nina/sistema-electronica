document.addEventListener('DOMContentLoaded', function() {
    
    // Función para abrir módulos (llamada desde el HTML)
    window.openModule = function(url) {
        // Mostrar overlay de carga
        showLoading();
        
        // Simular un pequeño delay para mostrar el loading
        setTimeout(() => {
            window.location.href = url;
        }, 500);
    };

window.cerrarSesion = function() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        window.location.href = '../index.php';
    }
};

    // Función para mostrar el overlay de carga
    function showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }

    // Función para ocultar el overlay de carga
    function hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    // Funcionalidad del menú móvil (hamburger)
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Cerrar menú móvil al hacer clic en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Cerrar menú móvil al hacer clic fuera de él
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Manejar efectos hover en los elementos del menú
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const dropdown = item.querySelector('.dropdown');
        
        if (dropdown) {
            // Mostrar dropdown al hacer hover
            item.addEventListener('mouseenter', () => {
                dropdown.style.display = 'block';
                dropdown.style.opacity = '0';
                dropdown.style.transform = 'translateY(-10px)';
                
                // Animación suave
                setTimeout(() => {
                    dropdown.style.opacity = '1';
                    dropdown.style.transform = 'translateY(0)';
                }, 10);
            });

            // Ocultar dropdown al salir
            item.addEventListener('mouseleave', () => {
                dropdown.style.opacity = '0';
                dropdown.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    dropdown.style.display = 'none';
                }, 200);
            });
        }
    });

    // Ocultar loading overlay cuando la página termine de cargar
    window.addEventListener('load', () => {
        hideLoading();
    });

    // Efecto de bienvenida
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
        welcomeSection.style.opacity = '0';
        welcomeSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            welcomeSection.style.transition = 'all 0.6s ease';
            welcomeSection.style.opacity = '1';
            welcomeSection.style.transform = 'translateY(0)';
        }, 100);
    }

    // Log para debug
    console.log('FormMenu.js cargado correctamente');
    console.log('Funciones disponibles: openModule, cerrarSesion');
});