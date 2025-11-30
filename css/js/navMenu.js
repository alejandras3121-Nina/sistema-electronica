// ✅ Estas funciones ahora estarán disponibles globalmente
window.navigateToModule = function(url) {
    window.location.href = url;
};

window.openModule = function(url) {
    window.location.href = url;
};

window.cerrarSesion = function() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        window.location.href = '../index.php';
    }
};

// ✅ Función para inicializar funcionalidad del navbar cargado dinámicamente
window.inicializarNavbar = function () {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) dropdown.style.display = 'block';
        });

        item.addEventListener('mouseleave', () => {
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) dropdown.style.display = 'none';
        });

        item.addEventListener('click', (e) => {
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) {
                e.preventDefault();
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });
    });
};

// Funciones específicas del módulo de productos (si está en esa página)
const btnAgregar = document.getElementById('btnAgregar');
if (btnAgregar) {
    btnAgregar.addEventListener('click', function () {
        alert('Función Agregar Producto');
    });
}

const btnActualizar = document.getElementById('btnActualizar');
if (btnActualizar) {
    btnActualizar.addEventListener('click', function () {
        alert('Función Actualizar Producto');
    });
}

const btnEliminar = document.getElementById('btnEliminar');
if (btnEliminar) {
    btnEliminar.addEventListener('click', function () {
        alert('Función Eliminar Producto');
    });
}

const btnGuardar = document.getElementById('btnGuardar');
if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
        alert('Función Guardar Producto');
    });
}

// Selección de filas en tabla de productos
const productTable = document.getElementById('productTable');
if (productTable) {
    const tableRows = productTable.querySelectorAll('tbody tr');

    tableRows.forEach(row => {
        row.addEventListener('click', function () {
            tableRows.forEach(r => r.classList.remove('selected'));
            this.classList.add('selected');

            const cells = this.querySelectorAll('td');
            if (cells.length >= 5) {
                document.getElementById('nombre').value = cells[1].textContent;
                document.getElementById('cantidad').value = cells[2].textContent;
                document.getElementById('precio').value = cells[3].textContent;
                document.getElementById('descripcion').value = cells[4].textContent;
            }
        });
    });
}

// 🎯 SOLO REEMPLAZO DE IMÁGENES POR EMOJIS
function replaceImagesWithEmojis() {
    const emojis = {
        'usuario': '👤',
        'producto': '📦',
        'cliente': '👥',
        'facturar': '🛒',
        'carrito': '🛒',
        'gestionar': '⚙️',
        'configuraciones': '⚙️',
        'nueva': '➕',
        'anadir': '➕',
        'cerrar': '🚪',
        'cerrar sesion': '🚪',
        'categoria': '📂',
        'categorias': '📂',
        'reportes': '📊',
        'reporte': '📊',
        'historial': '📋',
        'actualizar': '🔄',
        'eliminar': '🗑️',
        'guardar': '💾',
        'buscar': '🔍'
    };

    document.querySelectorAll('img').forEach(img => {
        const altText = img.alt.toLowerCase();
        const parent = img.parentNode;
        const replacement = document.createElement('span');
        replacement.style.fontSize = '16px';
        replacement.style.marginRight = '8px';
        replacement.className = 'emoji-icon';
        replacement.textContent = emojis[altText] || '📄';
        parent.replaceChild(replacement, img);
    });
}

// Ejecutar reemplazo cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceImagesWithEmojis);
} else {
    replaceImagesWithEmojis();
}

console.log('navMenu.js cargado correctamente');
console.log('Funciones disponibles: navigateToModule, openModule, cerrarSesion, inicializarNavbar');
