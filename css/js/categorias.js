class GestionarCategorias {
    constructor() {
        this.categoriaSeleccionada = null;
        this.modoEdicion = false;
        this.categoriasData = [];
        this.init();
    }

    init() {
        this.cargarCategorias();
        this.configurarEventos();
    }

    configurarEventos() {
        // Eventos de botones
        const eventos = {
            '.btn-new': () => this.crearCategoria(),
            '.btn-actualizar': () => this.habilitarEdicion(),
            '.btn-eliminar': () => this.eliminarCategoria(),
            '#guardar-btn': () => this.actualizarCategoria()
        };
        
        Object.entries(eventos).forEach(([selector, handler]) => {
            const elemento = document.querySelector(selector);
            if (elemento) {
                elemento.addEventListener('click', handler);
            }
        });

        // Evento de selección de fila
        const tabla = document.querySelector('table tbody');
        if (tabla) {
            tabla.addEventListener('click', (e) => {
                if (e.target.tagName === 'TD') {
                    this.seleccionarFila(e.target.parentNode);
                }
            });
        }

        // Validación en tiempo real para descripción
        const descripcionInput = document.getElementById('descripcion');
        if (descripcionInput) {
            descripcionInput.addEventListener('input', (e) => {
                if (e.target.value.length > 200) {
                    e.target.value = e.target.value.substring(0, 200);
                    this.mostrarMensaje('La descripción no puede exceder 200 caracteres', 'warning');
                }
            });
        }
    }

    async cargarCategorias() {
        try {
            const response = await fetch('../controlador/CategoriaController.php');
            const result = await response.json();

            if (result.success) {
                this.categoriasData = result.data;
                this.mostrarCategorias(result.data);
                console.log('Categorías cargadas:', result.data);
            } else {
                this.mostrarMensaje('Error al cargar categorías: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
            console.error('Error completo:', error);
        }
    }

    mostrarCategorias(categorias) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;

        tbody.innerHTML = categorias.map(categoria => {
            const id = categoria.idcategoria || categoria.idCategoria || 'N/A';
            const estado = categoria.estado == 1 ? 'Activo' : 'Inactivo';
            const inactivo = categoria.estado == 0;
            
            return `<tr data-id="${id}" ${inactivo ? 'style="background-color: #ffebee; color: #666;"' : ''}>
                <td>${id}</td>
                <td>${categoria.descripcion || ''}</td>
                <td><span class="estado-badge ${inactivo ? 'inactivo' : 'activo'}">${estado}</span></td>
            </tr>`;
        }).join('');
    }

    seleccionarFila(fila) {
        // Remover selección anterior
        document.querySelector('tr.selected')?.classList.remove('selected');
        fila.classList.add('selected');

        const idCategoria = parseInt(fila.getAttribute('data-id'));
        const categoriaCompleta = this.categoriasData.find(c => 
            (c.idcategoria == idCategoria) || (c.idCategoria == idCategoria)
        );

        if (!categoriaCompleta) return;

        this.categoriaSeleccionada = {
            id: categoriaCompleta.idcategoria || categoriaCompleta.idCategoria,
            descripcion: categoriaCompleta.descripcion || '',
            estado: categoriaCompleta.estado || 1
        };

        this.llenarFormulario(this.categoriaSeleccionada);
        this.configurarBotones('seleccion');
    }

    llenarFormulario(categoria) {
        const descripcionInput = document.getElementById('descripcion');
        if (descripcionInput) {
            descripcionInput.value = categoria.descripcion;
        }
    }

    limpiarFormulario() {
        const descripcionInput = document.getElementById('descripcion');
        if (descripcionInput) {
            descripcionInput.value = '';
        }

        this.categoriaSeleccionada = null;
        this.modoEdicion = false;
        this.configurarBotones('crear');
        document.querySelector('tr.selected')?.classList.remove('selected');
    }

    habilitarEdicion() {
        if (!this.categoriaSeleccionada) {
            this.mostrarMensaje('Seleccione una categoría para actualizar', 'warning');
            return;
        }

        this.modoEdicion = true;
        this.configurarBotones('edicion');
        this.mostrarMensaje('Modo edición activado. Modifique los datos y haga clic en "Guardar Cambios"', 'info');
        
        const descripcionInput = document.getElementById('descripcion');
        if (descripcionInput) {
            descripcionInput.focus();
        }
    }

    configurarBotones(modo) {
        const botones = {
            crear: document.querySelector('.btn-new'),
            actualizar: document.querySelector('.btn-actualizar'),
            eliminar: document.querySelector('.btn-eliminar'),
            guardar: document.getElementById('guardar-btn')
        };

        // Crear botón guardar si no existe
        if (!botones.guardar) {
            const container = document.querySelector('.buttons');
            if (container) {
                const guardarBtn = document.createElement('button');
                guardarBtn.id = 'guardar-btn';
                guardarBtn.className = 'btn btn-guardar';
                guardarBtn.textContent = 'Guardar Cambios';
                guardarBtn.style.display = 'none';
                guardarBtn.addEventListener('click', () => this.actualizarCategoria());
                container.appendChild(guardarBtn);
                botones.guardar = guardarBtn;
            }
        }

        const configs = {
            crear: { 
                crear: ['Nueva Categoria', false], 
                actualizar: [null, true], 
                eliminar: [null, true], 
                guardar: [null, true] 
            },
            seleccion: { 
                crear: ['Nueva Categoria', false], 
                actualizar: [null, false], 
                eliminar: [null, false], 
                guardar: [null, true] 
            },
            edicion: { 
                crear: ['Cancelar', false], 
                actualizar: [null, true], 
                eliminar: [null, true], 
                guardar: [null, false] 
            }
        };

        Object.entries(configs[modo]).forEach(([boton, [texto, disabled]]) => {
            if (botones[boton]) {
                if (texto) botones[boton].textContent = texto;
                botones[boton].disabled = disabled;
                
                // Mostrar/ocultar botón guardar
                if (boton === 'guardar') {
                    botones[boton].style.display = disabled ? 'none' : 'inline-block';
                }
            }
        });
    }

    async crearCategoria() {
        if (this.modoEdicion) {
            this.cancelarEdicion();
            return;
        }

        const datos = this.obtenerDatosFormulario();
        if (!this.validarDatos(datos)) return;

        await this.peticionHTTP('POST', '../controlador/CategoriaController.php', datos);
    }

    async actualizarCategoria() {
        if (!this.categoriaSeleccionada?.id) {
            this.mostrarMensaje('No hay categoría seleccionada para actualizar', 'warning');
            return;
        }

        const datos = this.obtenerDatosFormulario();
        if (!this.validarDatos(datos)) return;

        await this.peticionHTTP('PUT', `../controlador/CategoriaController.php?id=${this.categoriaSeleccionada.id}`, datos);
    }

    async eliminarCategoria() {
        if (!this.categoriaSeleccionada?.id) {
            this.mostrarMensaje('Seleccione una categoría para eliminar', 'warning');
            return;
        }

        if (!confirm('¿Está seguro de eliminar permanentemente esta categoría de la base de datos?\n\nEsta acción NO se puede deshacer y puede afectar productos asociados.')) {
            return;
        }

        await this.peticionHTTP('DELETE', `../controlador/CategoriaController.php?id=${this.categoriaSeleccionada.id}`);
    }

    async peticionHTTP(method, url, body = null) {
        try {
            const options = { method, headers: { 'Content-Type': 'application/json' } };
            if (body) options.body = JSON.stringify(body);

            const response = await fetch(url, options);
            const result = await response.json();

            if (result.success) {
                this.mostrarMensaje(result.message, 'success');
                this.limpiarFormulario();
                this.cargarCategorias();
            } else {
                this.mostrarMensaje('Error: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    cancelarEdicion() {
        if (this.categoriaSeleccionada) {
            this.llenarFormulario(this.categoriaSeleccionada);
        }
        this.modoEdicion = false;
        this.configurarBotones('seleccion');
        this.mostrarMensaje('Edición cancelada', 'info');
    }

    obtenerDatosFormulario() {
        const descripcionInput = document.getElementById('descripcion');
        return {
            descripcion: descripcionInput ? descripcionInput.value.trim() : '',
            estado: 1
        };
    }

    validarDatos(datos) {
        const { descripcion } = datos;
        
        if (!descripcion) {
            this.mostrarMensaje('La descripción es obligatoria', 'warning');
            return false;
        }

        if (descripcion.length > 200) {
            this.mostrarMensaje('La descripción no puede exceder 200 caracteres', 'warning');
            return false;
        }

        return true;
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        document.querySelector('.mensaje')?.remove();

        const colores = {
            success: '#4CAF50',
            error: '#f44336', 
            warning: '#ff9800',
            info: '#2196F3'
        };

        const div = document.createElement('div');
        Object.assign(div, {
            className: `mensaje ${tipo}`,
            textContent: mensaje
        });

        Object.assign(div.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 15px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '1000',
            maxWidth: '300px',
            backgroundColor: colores[tipo]
        });

        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    }
}

// Inicializar al cargar DOM
document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', () => new GestionarCategorias())
    : new GestionarCategorias();