// ==============================================
// SISTEMA DE FILTROS Y BÚSQUEDA DE PRODUCTOS
// ==============================================

class FiltrosProductos {
    constructor(gestionarProductos) {
        this.gestion = gestionarProductos;
        this.productosFiltrados = [];
        this.filtroActual = {
            categoria: '',
            busqueda: '',
            estado: '',
            stock: ''
        };
        
        this.init();
    }

    init() {
        this.crearInterfazFiltros();
        this.configurarEventos();
    }

    crearInterfazFiltros() {
        // Buscar el contenedor donde insertar los filtros (antes de la tabla)
        const tableSection = document.querySelector('.table-section');
        if (!tableSection) return;

        // Crear el HTML de los filtros
        const filtrosHTML = `
            <div class="filters-container" id="filtrosContainer">
                <div class="filters-header">
                    <h3>🔍 Filtros y Búsqueda</h3>
                    <button class="btn-reset-filters" id="btnResetFiltros">
                        🗑️ Limpiar Filtros
                    </button>
                </div>
                
                <div class="filters-grid">
                    <!-- Barra de búsqueda principal -->
                    <div class="search-container">
                        <div class="search-input-wrapper">
                            <input type="text" 
                                   id="busquedaProductos" 
                                   class="search-input" 
                                   placeholder="🔍 Buscar productos por nombre..."
                                   autocomplete="off">
                            <div class="search-suggestions" id="sugerenciasBusqueda"></div>
                        </div>
                    </div>

                    <!-- Filtro por categoría -->
                    <div class="filter-group">
                        <label for="filtroCategorias">📂 Categoría:</label>
                        <select id="filtroCategorias" class="filter-select">
                            <option value="">🏷️ Todas las categorías</option>
                        </select>
                    </div>

                    <!-- Filtro por estado -->
                    <div class="filter-group">
                        <label for="filtroEstado">📊 Estado:</label>
                        <select id="filtroEstado" class="filter-select">
                            <option value="">📋 Todos los estados</option>
                            <option value="1">✅ Activos</option>
                            <option value="0">❌ Inactivos</option>
                        </select>
                    </div>

                    <!-- Filtro por stock -->
                    <div class="filter-group">
                        <label for="filtroStock">📦 Stock:</label>
                        <select id="filtroStock" class="filter-select">
                            <option value="">📊 Todos los niveles</option>
                            <option value="agotado">🚫 Agotados (0)</option>
                            <option value="bajo">⚠️ Bajo stock (≤5)</option>
                            <option value="disponible">✅ Disponible (>5)</option>
                        </select>
                    </div>
                </div>

                <!-- Contador de resultados -->
                <div class="results-counter">
                    <span id="contadorResultados">📈 Mostrando todos los productos</span>
                </div>
            </div>
        `;

        // Insertar antes de la tabla
        tableSection.insertAdjacentHTML('beforebegin', filtrosHTML);
        
        // Agregar estilos CSS
        this.agregarEstilos();
        
        // Llenar el select de categorías
        this.llenarFiltroCategoria();
    }

    agregarEstilos() {
        const style = document.createElement('style');
        style.textContent = `
            /* Contenedor principal de filtros */
            .filters-container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 25px;
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: white;
            }

            .filters-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            }

            .filters-header h3 {
                margin: 0;
                font-size: 1.4em;
                font-weight: 600;
                color: white;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            .btn-reset-filters {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 0.9em;
                font-weight: 500;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .btn-reset-filters:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }

            .filters-grid {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 20px;
                margin-bottom: 15px;
            }

            @media (max-width: 1200px) {
                .filters-grid {
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
            }

            @media (max-width: 768px) {
                .filters-grid {
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
            }

            /* Búsqueda principal */
            .search-container {
                position: relative;
            }

            .search-input-wrapper {
                position: relative;
            }

            .search-input {
                width: 100%;
                padding: 12px 20px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 25px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 1em;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .search-input::placeholder {
                color: rgba(255, 255, 255, 0.7);
            }

            .search-input:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.6);
                background: rgba(255, 255, 255, 0.2);
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
            }

            /* Sugerencias de búsqueda */
            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
                display: none;
                margin-top: 5px;
            }

            .search-suggestions.show {
                display: block;
            }

            .suggestion-item {
                padding: 12px 20px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                color: #333;
                transition: background-color 0.2s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .suggestion-item:hover {
                background-color: #f8f9ff;
                color: #667eea;
            }

            .suggestion-item:last-child {
                border-bottom: none;
                border-radius: 0 0 12px 12px;
            }

            .suggestion-item:first-child {
                border-radius: 12px 12px 0 0;
            }

            /* Grupos de filtros */
            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .filter-group label {
                font-weight: 600;
                color: white;
                font-size: 0.9em;
                text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }

            .filter-select {
                padding: 10px 15px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 20px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 0.9em;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .filter-select option {
                background: #333;
                color: white;
                padding: 8px;
            }

            .filter-select:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.6);
                background: rgba(255, 255, 255, 0.2);
            }

            /* Contador de resultados */
            .results-counter {
                text-align: center;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.9);
                font-size: 0.95em;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }

            /* Animaciones */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .filters-container {
                animation: fadeIn 0.5s ease-out;
            }

            /* Efectos de hover mejorados */
            .filter-select:hover, .search-input:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            /* Indicador de filtro activo */
            .filter-active {
                background: rgba(255, 255, 255, 0.3) !important;
                border-color: rgba(255, 255, 255, 0.7) !important;
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }

    configurarEventos() {
        // Búsqueda en tiempo real
        const inputBusqueda = document.getElementById('busquedaProductos');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('input', (e) => {
                this.buscarProductos(e.target.value);
            });

            inputBusqueda.addEventListener('focus', () => {
                if (inputBusqueda.value.trim()) {
                    this.mostrarSugerencias(inputBusqueda.value);
                }
            });

            // Cerrar sugerencias al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-input-wrapper')) {
                    this.ocultarSugerencias();
                }
            });
        }

        // Filtros
        const filtros = ['filtroCategorias', 'filtroEstado', 'filtroStock'];
        filtros.forEach(filtroId => {
            const elemento = document.getElementById(filtroId);
            if (elemento) {
                elemento.addEventListener('change', () => this.aplicarFiltros());
            }
        });

        // Botón reset
        const btnReset = document.getElementById('btnResetFiltros');
        if (btnReset) {
            btnReset.addEventListener('click', () => this.resetearFiltros());
        }
    }

    buscarProductos(termino) {
        this.filtroActual.busqueda = termino.toLowerCase().trim();
        
        if (termino.trim().length > 0) {
            this.mostrarSugerencias(termino);
        } else {
            this.ocultarSugerencias();
        }
        
        this.aplicarFiltros();
    }

    mostrarSugerencias(termino) {
        const sugerenciasContainer = document.getElementById('sugerenciasBusqueda');
        if (!sugerenciasContainer || !this.gestion.productosData) return;

        const terminoLower = termino.toLowerCase().trim();
        if (terminoLower.length < 2) {
            this.ocultarSugerencias();
            return;
        }

        // Filtrar productos que coincidan
        const coincidencias = this.gestion.productosData
            .filter(producto => 
                producto.nombre?.toLowerCase().includes(terminoLower) ||
                producto.descripcion?.toLowerCase().includes(terminoLower)
            )
            .slice(0, 8); // Limitar a 8 sugerencias

        if (coincidencias.length === 0) {
            sugerenciasContainer.innerHTML = '<div class="suggestion-item">❌ No se encontraron productos</div>';
        } else {
            sugerenciasContainer.innerHTML = coincidencias
                .map(producto => {
                    const stock = parseInt(producto.cantidad) || 0;
                    const stockIcon = stock <= 0 ? '🚫' : stock <= 5 ? '⚠️' : '✅';
                    const precio = parseFloat(producto.precio || 0).toFixed(2);
                    
                    return `
                        <div class="suggestion-item" data-producto-id="${producto.idproducto || producto.idProducto}">
                            <span>${stockIcon}</span>
                            <div>
                                <strong>${producto.nombre}</strong>
                                <div style="font-size: 0.8em; color: #666;">
                                    Stock: ${stock} | Precio: $${precio} | ${producto.categoria || 'Sin categoría'}
                                </div>
                            </div>
                        </div>
                    `;
                })
                .join('');

            // Agregar eventos a las sugerencias
            sugerenciasContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const productoId = e.currentTarget.getAttribute('data-producto-id');
                    if (productoId) {
                        this.seleccionarProductoPorId(productoId);
                    }
                    this.ocultarSugerencias();
                });
            });
        }

        sugerenciasContainer.classList.add('show');
    }

    ocultarSugerencias() {
        const sugerenciasContainer = document.getElementById('sugerenciasBusqueda');
        if (sugerenciasContainer) {
            sugerenciasContainer.classList.remove('show');
        }
    }

    seleccionarProductoPorId(productoId) {
        // Buscar la fila del producto en la tabla
        const fila = document.querySelector(`tr[data-id="${productoId}"]`);
        if (fila) {
            // Simular clic en la fila para seleccionarla
            this.gestion.seleccionarFila(fila);
            
            // Scroll hacia la fila seleccionada
            fila.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Efecto visual temporal
            fila.style.transition = 'background-color 0.5s ease';
            fila.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                fila.style.backgroundColor = '#e3f2fd';
            }, 1000);
        }
    }

    aplicarFiltros() {
        if (!this.gestion.productosData) return;

        // Obtener valores de filtros
        this.filtroActual.categoria = document.getElementById('filtroCategorias')?.value || '';
        this.filtroActual.estado = document.getElementById('filtroEstado')?.value || '';
        this.filtroActual.stock = document.getElementById('filtroStock')?.value || '';

        // Aplicar filtros
        this.productosFiltrados = this.gestion.productosData.filter(producto => {
            // Filtro por búsqueda
            if (this.filtroActual.busqueda) {
                const coincideBusqueda = 
                    producto.nombre?.toLowerCase().includes(this.filtroActual.busqueda) ||
                    producto.descripcion?.toLowerCase().includes(this.filtroActual.busqueda);
                if (!coincideBusqueda) return false;
            }

            // Filtro por categoría
            if (this.filtroActual.categoria) {
                const idCategoria = producto.idCategoria || producto.idcategoria;
                if (idCategoria != this.filtroActual.categoria) return false;
            }

            // Filtro por estado
            if (this.filtroActual.estado !== '') {
                if (producto.estado != this.filtroActual.estado) return false;
            }

            // Filtro por stock
            if (this.filtroActual.stock) {
                const cantidad = parseInt(producto.cantidad) || 0;
                switch (this.filtroActual.stock) {
                    case 'agotado':
                        if (cantidad > 0) return false;
                        break;
                    case 'bajo':
                        if (cantidad === 0 || cantidad > 5) return false;
                        break;
                    case 'disponible':
                        if (cantidad <= 5) return false;
                        break;
                }
            }

            return true;
        });

        // Mostrar productos filtrados
        this.gestion.mostrarProductos(this.productosFiltrados);
        this.actualizarContadorResultados();
        this.marcarFiltrosActivos();
    }

    actualizarContadorResultados() {
        const contador = document.getElementById('contadorResultados');
        if (!contador) return;

        const total = this.gestion.productosData?.length || 0;
        const filtrados = this.productosFiltrados.length;
        
        if (this.hayFiltrosActivos()) {
            contador.innerHTML = `📊 Mostrando ${filtrados} de ${total} productos`;
            if (filtrados === 0) {
                contador.innerHTML += ' - ❌ No se encontraron coincidencias';
                contador.style.color = '#ffcdd2';
            } else {
                contador.style.color = 'rgba(255, 255, 255, 0.9)';
            }
        } else {
            contador.innerHTML = `📈 Mostrando todos los productos (${total})`;
            contador.style.color = 'rgba(255, 255, 255, 0.9)';
        }
    }

    marcarFiltrosActivos() {
        // Marcar visualmente los filtros que están activos
        const filtros = [
            { id: 'busquedaProductos', valor: this.filtroActual.busqueda },
            { id: 'filtroCategorias', valor: this.filtroActual.categoria },
            { id: 'filtroEstado', valor: this.filtroActual.estado },
            { id: 'filtroStock', valor: this.filtroActual.stock }
        ];

        filtros.forEach(filtro => {
            const elemento = document.getElementById(filtro.id);
            if (elemento) {
                if (filtro.valor) {
                    elemento.classList.add('filter-active');
                } else {
                    elemento.classList.remove('filter-active');
                }
            }
        });
    }

    hayFiltrosActivos() {
        return !!(
            this.filtroActual.busqueda ||
            this.filtroActual.categoria ||
            this.filtroActual.estado !== '' ||
            this.filtroActual.stock
        );
    }

    resetearFiltros() {
        // Limpiar valores
        this.filtroActual = {
            categoria: '',
            busqueda: '',
            estado: '',
            stock: ''
        };

        // Resetear elementos del DOM
        const elementos = [
            'busquedaProductos',
            'filtroCategorias', 
            'filtroEstado', 
            'filtroStock'
        ];

        elementos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = '';
                elemento.classList.remove('filter-active');
            }
        });

        // Ocultar sugerencias
        this.ocultarSugerencias();

        // Mostrar todos los productos
        this.productosFiltrados = [...(this.gestion.productosData || [])];
        this.gestion.mostrarProductos(this.productosFiltrados);
        this.actualizarContadorResultados();

        // Mostrar mensaje
        this.gestion.mostrarMensaje('🗑️ Filtros limpiados - Mostrando todos los productos', 'info');
    }

    llenarFiltroCategoria() {
        const select = document.getElementById('filtroCategorias');
        if (!select || !this.gestion.categoriasData) return;

        // Limpiar opciones existentes (excepto la primera)
        select.innerHTML = '<option value="">🏷️ Todas las categorías</option>';

        // Agregar categorías
        this.gestion.categoriasData.forEach(categoria => {
            const id = categoria.id || categoria.idCategoria;
            const nombre = categoria.nombre || categoria.descripcion;
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `📂 ${nombre}`;
            select.appendChild(option);
        });
    }

    // Método para actualizar cuando se cargan nuevos datos
    actualizarDatos() {
        this.llenarFiltroCategoria();
        if (this.hayFiltrosActivos()) {
            this.aplicarFiltros();
        } else {
            this.productosFiltrados = [...(this.gestion.productosData || [])];
            this.actualizarContadorResultados();
        }
    }
}

// ==============================================
// INTEGRACIÓN CON EL SISTEMA EXISTENTE
// ==============================================

// Modificar la clase GestionarProductos existente para integrar los filtros
if (typeof GestionarProductos !== 'undefined') {
    // Guardar el método original de cargarProductos
    const originalCargarProductos = GestionarProductos.prototype.cargarProductos;
    const originalCargarCategorias = GestionarProductos.prototype.cargarCategorias;

    // Sobrescribir cargarProductos para actualizar filtros
    GestionarProductos.prototype.cargarProductos = async function() {
        await originalCargarProductos.call(this);
        if (this.filtros) {
            this.filtros.actualizarDatos();
        }
    };

    // Sobrescribir cargarCategorias para actualizar filtros
    GestionarProductos.prototype.cargarCategorias = async function() {
        await originalCargarCategorias.call(this);
        if (this.filtros) {
            this.filtros.actualizarDatos();
        }
    };

    // Modificar el init para crear los filtros
    const originalInit = GestionarProductos.prototype.init;
    GestionarProductos.prototype.init = function() {
        originalInit.call(this);
        
        // Inicializar filtros después de que todo esté cargado
        setTimeout(() => {
            this.filtros = new FiltrosProductos(this);
        }, 500);
    };
}

// Para desarrollo/testing independiente
if (typeof window !== 'undefined' && !window.gestionarProductos) {
    document.addEventListener('DOMContentLoaded', () => {
        // Esperar a que GestionarProductos esté disponible
        const checkGestion = setInterval(() => {
            if (window.gestionarProductos) {
                clearInterval(checkGestion);
                window.gestionarProductos.filtros = new FiltrosProductos(window.gestionarProductos);
            }
        }, 100);
    });
}