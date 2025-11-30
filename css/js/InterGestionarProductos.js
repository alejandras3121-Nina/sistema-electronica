class GestionarProductos {
    constructor() {
        this.modoCreacion = false;
        this.modoEdicion = false;
        this.productoSeleccionado = null;
        this.productosData = [];
        this.categoriasData = [];
        this.proveedoresData = [];
        this.LIMITE_BAJO_STOCK = 5;
        this.LIMITE_AGOTADO = 0;
        
        this.elementos = {};
        this.cachearElementos();
        this.init();
    }

    cachearElementos() {
        const selectores = {
            btnAgregar: '#btnAgregar',
            btnGuardar: '#btnGuardar',
            btnActualizar: '#btnActualizar',
            btnEliminar: '#btnEliminar',
            tabla: '#productTable',
            tbody: '#productTable tbody',
            campos: ['nombre', 'cantidad', 'precio', 'descripcion', 'iva', 'categoria', 'proveedor']
        };

        Object.entries(selectores).forEach(([key, value]) => {
            if (key === 'campos') {
                this.elementos[key] = {};
                value.forEach(campo => {
                    this.elementos[key][campo] = document.getElementById(campo);
                });
            } else {
                this.elementos[key] = document.querySelector(value);
            }
        });
    }

    init() {
        this.cargarCategorias();
        this.cargarProveedores();
        this.cargarProductos();
        this.configurarEventos();
        this.toggleFormulario(false);
        this.configurarBotones('inicial');
    }

    // Método corregido para cargar proveedores
    async cargarProveedores() {
        console.log('🔄 Iniciando carga de proveedores...');
        
        try {
            const response = await fetch('../controlador/getProveedores.php');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📦 Respuesta completa de proveedores:', result);

            if (result.success && Array.isArray(result.data)) {
                this.proveedoresData = result.data;
                console.log('✅ Proveedores cargados exitosamente:', this.proveedoresData);
                this.llenarSelectProveedores();
            } else {
                console.warn('⚠️ No se pudieron cargar proveedores:', result.message || 'Respuesta inválida');
                this.proveedoresData = [];
                this.llenarSelectProveedores();
                this.mostrarMensaje(result.message || 'Error al cargar proveedores', 'warning');
            }
        } catch (error) {
            console.error('❌ Error al cargar proveedores:', error);
            this.proveedoresData = [];
            this.llenarSelectProveedores();
            this.mostrarMensaje('Error de conexión al cargar proveedores: ' + error.message, 'error');
        }
    }

    // Método corregido para llenar select de proveedores
    llenarSelectProveedores() {
        const select = this.elementos.campos.proveedor;
        if (!select) {
            console.error('❌ Select de proveedores no encontrado');
            return;
        }

        console.log('🔧 Llenando select con proveedores:', this.proveedoresData);

        if (!Array.isArray(this.proveedoresData) || this.proveedoresData.length === 0) {
            select.innerHTML = '<option value="">No hay proveedores disponibles</option>';
            console.warn('⚠️ No hay proveedores para mostrar');
            return;
        }

        // Construir opciones del select
        let opciones = '<option value="">Seleccione proveedor...</option>';
        
        this.proveedoresData.forEach(proveedor => {
            // CORREGIDO: Usar nombres en minúsculas como vienen de la BD
            const id = proveedor.idproveedor;  // ✅ Cambiado de idProveedor a idproveedor
            const nombre = proveedor.nombreempresa || 'Sin nombre';  // ✅ Cambiado de nombreEmpresa a nombreempresa
            
            opciones += `<option value="${id}">${nombre}</option>`;
            console.log(`📋 Agregando opción: ID=${id}, Nombre=${nombre}`);
        });

        select.innerHTML = opciones;
        console.log('✅ Select de proveedores llenado correctamente');
    }

    configurarEventos() {
        const eventos = [
            [this.elementos.btnAgregar, 'click', () => this.toggleModoCreacion()],
            [this.elementos.btnGuardar, 'click', () => this.guardarProducto()],
            [this.elementos.btnActualizar, 'click', () => this.habilitarEdicion()],
            [this.elementos.btnEliminar, 'click', () => this.eliminarProducto()],
            [this.elementos.tabla, 'click', (e) => {
                if (e.target.tagName === 'TD') this.seleccionarFila(e.target.parentNode);
            }]
        ];

        eventos.forEach(([el, evento, handler]) => el?.addEventListener(evento, handler));

        this.configurarValidaciones();
    }

    configurarValidaciones() {
        const limits = { nombre: 100, descripcion: 255 };
        Object.entries(limits).forEach(([field, limit]) => {
            const el = this.elementos.campos[field];
            if (el) {
                el.addEventListener('input', (e) => {
                    if (e.target.value.length > limit) {
                        e.target.value = e.target.value.substring(0, limit);
                        this.mostrarMensaje(`${field} no puede exceder ${limit} caracteres`, 'warning');
                    }
                });
            }
        });

        ['precio', 'cantidad'].forEach(field => {
            const el = this.elementos.campos[field];
            if (el) {
                el.addEventListener('input', (e) => {
                    if (e.target.value < 0) e.target.value = 0;
                });
            }
        });
    }

    async cargarCategorias() {
        try {
            const response = await fetch('../controlador/getCategorias.php');
            const result = await response.json();
            this.categoriasData = result.success ? result.data : [];
            this.llenarSelectCategorias();
            if (!result.success) this.mostrarMensaje('Error al cargar categorías', 'warning');
        } catch (error) {
            this.categoriasData = [];
            this.llenarSelectCategorias();
            this.mostrarMensaje('Error de conexión al cargar categorías', 'warning');
        }
    }

    llenarSelectCategorias() {
        const select = this.elementos.campos.categoria;
        if (!select) return;

        if (!Array.isArray(this.categoriasData) || this.categoriasData.length === 0) {
            select.innerHTML = '<option value="">No hay categorías disponibles</option>';
            return;
        }

        select.innerHTML = '<option value="">Seleccione categoría...</option>' +
            this.categoriasData.map(c => `<option value="${c.id || c.idCategoria}">${c.nombre || c.descripcion}</option>`).join('');
    }

    async cargarProductos() {
        try {
            const response = await fetch('../controlador/Producto.php');
            const result = await response.json();

            if (result.success) {
                this.productosData = result.data;
                this.mostrarProductos(result.data);
                this.verificarAlertasInventario();
            } else {
                this.mostrarMensaje('Error al cargar productos: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    verificarAlertasInventario() {
        if (!this.productosData?.length) return;

        const alertas = { agotados: [], bajoStock: [] };

        this.productosData.forEach(producto => {
            const cantidad = parseInt(producto.cantidad) || 0;
            const nombre = producto.nombre || 'Sin nombre';
            
            if (producto.estado == 1) {
                if (cantidad <= this.LIMITE_AGOTADO) {
                    alertas.agotados.push(nombre);
                } else if (cantidad <= this.LIMITE_BAJO_STOCK) {
                    alertas.bajoStock.push(nombre);
                }
            }
        });

        this.mostrarAlertas(alertas);
    }

    mostrarAlertas(alertas) {
        const { agotados, bajoStock } = alertas;

        if (agotados.length > 0) {
            const mensaje = agotados.length === 1 
                ? `Producto agotado: ${agotados[0]}`
                : `Productos agotados (${agotados.length}): ${agotados.join(', ')}`;
            this.mostrarAlertaInventario(mensaje, 'agotado');
        }

        if (bajoStock.length > 0) {
            const mensaje = bajoStock.length === 1 
                ? `Producto a punto de agotarse: ${bajoStock[0]}`
                : `Productos a punto de agotarse (${bajoStock.length}): ${bajoStock.join(', ')}`;
            this.mostrarAlertaInventario(mensaje, 'bajo-stock');
        }

        if (agotados.length > 0 && bajoStock.length > 0) {
            setTimeout(() => {
                this.mostrarAlertaInventario(
                    `⚠️ Resumen de inventario: ${agotados.length} producto(s) agotado(s) y ${bajoStock.length} con bajo stock`,
                    'resumen'
                );
            }, 2000);
        }
    }

    mostrarAlertaInventario(mensaje, tipo) {
        const alertaDiv = document.createElement('div');
        alertaDiv.id = `alerta-inventario-${Date.now()}`;
        alertaDiv.className = `alerta-inventario ${tipo}`;
        
        const configs = {
            'agotado': { bg: '#f44336', icon: '🚫' },
            'bajo-stock': { bg: '#ff9800', icon: '⚠️' },
            'resumen': { bg: '#9c27b0', icon: '📊' }
        };

        const config = configs[tipo] || configs['bajo-stock'];

        Object.assign(alertaDiv.style, {
            position: 'fixed', top: '80px', right: '20px', maxWidth: '400px',
            padding: '15px 20px', borderRadius: '8px', backgroundColor: config.bg,
            color: 'white', fontWeight: 'bold', zIndex: '1001',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.3)',
            transform: 'translateX(100%)', transition: 'transform 0.4s ease',
            cursor: 'pointer', fontSize: '14px', lineHeight: '1.4'
        });

        alertaDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <span style="font-size: 20px; flex-shrink: 0;">${config.icon}</span>
                <div>
                    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">ALERTA DE INVENTARIO</div>
                    <div>${mensaje}</div>
                    <div style="font-size: 11px; opacity: 0.8; margin-top: 4px;">Click para cerrar</div>
                </div>
            </div>
        `;

        document.body.appendChild(alertaDiv);
        setTimeout(() => alertaDiv.style.transform = 'translateX(0)', 100);

        const cerrarAlerta = () => {
            alertaDiv.style.transform = 'translateX(100%)';
            setTimeout(() => alertaDiv.remove(), 400);
        };

        alertaDiv.addEventListener('click', cerrarAlerta);
        setTimeout(cerrarAlerta, 8000);
    }

    mostrarProductos(productos) {
        if (!this.elementos.tbody) return;

        if (productos.length === 0) {
            this.elementos.tbody.innerHTML = '<tr><td colspan="9">No hay productos para mostrar</td></tr>';
            return;
        }

        this.elementos.tbody.innerHTML = productos.map(producto => {
            const estado = producto.estado == 1 ? 'Activo' : 'Inactivo';
            const precio = parseFloat(producto.precio || 0).toFixed(2);
            const id = producto.idproducto || producto.idProducto;
            const cantidad = parseInt(producto.cantidad) || 0;

            const estilos = this.obtenerEstilosProducto(producto, cantidad);

            return `
                <tr data-id="${id}" style="cursor: pointer; ${estilos.background}"${estilos.title}>
                    <td>${id}</td>
                    <td>${producto.nombre || ''}</td>
                    <td style="${estilos.cantidad}">${cantidad}</td>
                    <td>${precio}</td>
                    <td>${producto.descripcion || ''}</td>
                    <td>${producto.porcentajeiva || producto.porcentajeIva || 0}%</td>
                    <td>${producto.categoria || 'Sin categoría'}</td>
                    <td>${producto.proveedor || 'Sin proveedor'}</td>
                    <td><span class="estado-badge ${producto.estado == 1 ? 'activo' : 'inactivo'}">${estado}</span></td>
                </tr>
            `;
        }).join('');
    }

    obtenerEstilosProducto(producto, cantidad) {
        let background = '';
        let title = '';
        let cantidadStyle = '';

        if (producto.estado == 1) {
            if (cantidad <= this.LIMITE_AGOTADO) {
                background = 'background-color: #ffebee; border-left: 4px solid #f44336;';
                title = ' title="🚫 PRODUCTO AGOTADO"';
                cantidadStyle = 'color: #f44336; font-weight: bold;';
            } else if (cantidad <= this.LIMITE_BAJO_STOCK) {
                background = 'background-color: #fff3e0; border-left: 4px solid #ff9800;';
                title = ' title="⚠️ PRODUCTO CON BAJO STOCK"';
                cantidadStyle = 'color: #ff9800; font-weight: bold;';
            }
        } else {
            background = 'background-color: #ffebee; color: #666;';
        }

        return { background, title, cantidad: cantidadStyle };
    }

    seleccionarFila(fila) {
        const filaAnterior = document.querySelector('tr.selected');
        if (filaAnterior) {
            filaAnterior.classList.remove('selected');
            filaAnterior.style.backgroundColor = filaAnterior.getAttribute('data-estado') == '0' ? '#ffebee' : '';
        }

        fila.classList.add('selected');
        fila.style.backgroundColor = '#e3f2fd';

        const idProducto = parseInt(fila.getAttribute('data-id'));
        const productoCompleto = this.productosData.find(p => 
            (p.idproducto == idProducto) || (p.idProducto == idProducto)
        );

        if (!productoCompleto) return;

        // CORREGIDO: Manejar ambos casos para todas las propiedades
        this.productoSeleccionado = {
            id: productoCompleto.idproducto || productoCompleto.idProducto,
            nombre: productoCompleto.nombre || '',
            cantidad: productoCompleto.cantidad || 0,
            precio: productoCompleto.precio || 0,
            descripcion: productoCompleto.descripcion || '',
            porcentajeIva: productoCompleto.porcentajeiva || productoCompleto.porcentajeIva || 16,
            idCategoria: productoCompleto.idCategoria || productoCompleto.idcategoria,
            categoria: productoCompleto.categoria || '',
            // CORREGIDO: Manejar ambos casos para el ID del proveedor
            idProveedor: productoCompleto.idProveedor || productoCompleto.idproveedor,
            proveedor: productoCompleto.proveedor || '',
            estado: productoCompleto.estado || 1
        };

        console.log('🎯 Producto seleccionado:', this.productoSeleccionado);
        this.llenarFormulario(this.productoSeleccionado);
        this.configurarBotones('seleccion');
        this.toggleFormulario(false);

        this.verificarStockProductoSeleccionado();
    }

    verificarStockProductoSeleccionado() {
        const cantidad = parseInt(this.productoSeleccionado.cantidad);
        if (this.productoSeleccionado.estado == 1) {
            if (cantidad <= this.LIMITE_AGOTADO) {
                this.mostrarMensaje(`⚠️ El producto "${this.productoSeleccionado.nombre}" está AGOTADO`, 'error');
            } else if (cantidad <= this.LIMITE_BAJO_STOCK) {
                this.mostrarMensaje(`⚠️ El producto "${this.productoSeleccionado.nombre}" tiene bajo stock (${cantidad} unidades)`, 'warning');
            }
        }
    }

    // CORREGIDO: Método llenarFormulario actualizado
    llenarFormulario(producto) {
        const valores = {
            nombre: producto.nombre,
            cantidad: producto.cantidad,
            precio: producto.precio,
            descripcion: producto.descripcion,
            iva: producto.porcentajeIva,
            categoria: producto.idCategoria,
            // CORREGIDO: Usar idProveedor (puede venir como idProveedor o idproveedor dependiendo del contexto)
            proveedor: producto.idProveedor || producto.idproveedor
        };

        console.log('📝 Llenando formulario con valores:', valores);

        Object.entries(valores).forEach(([campo, valor]) => {
            if (this.elementos.campos[campo]) {
                this.elementos.campos[campo].value = valor || '';
                console.log(`✏️ Campo ${campo}: ${valor}`);
            }
        });
    }

    habilitarEdicion() {
        if (!this.productoSeleccionado) {
            this.mostrarMensaje('Seleccione un producto para actualizar', 'warning');
            return;
        }

        this.modoEdicion = true;
        this.toggleFormulario(true);
        this.configurarBotones('edicion');
        this.mostrarMensaje('Modo edición activado. Modifique los datos y haga clic en "Guardar"', 'info');
        this.elementos.campos.nombre?.focus();
    }

    configurarBotones(modo) {
        const configuraciones = {
            inicial: { btnAgregar: false, btnActualizar: true, btnEliminar: true, btnGuardar: true },
            creacion: { btnAgregar: false, btnActualizar: true, btnEliminar: true, btnGuardar: false },
            seleccion: { btnAgregar: false, btnActualizar: false, btnEliminar: false, btnGuardar: true },
            edicion: { btnAgregar: true, btnActualizar: true, btnEliminar: true, btnGuardar: false }
        };

        const config = configuraciones[modo];
        Object.entries(config).forEach(([boton, disabled]) => {
            if (this.elementos[boton]) this.elementos[boton].disabled = disabled;
        });
    }

    toggleModoCreacion() {
        if (this.modoCreacion) {
            this.resetearFormulario();
            this.modoCreacion = false;
            this.elementos.btnAgregar.textContent = 'Agregar Producto';
            this.configurarBotones('inicial');
        } else {
            this.resetearFormulario();
            this.toggleFormulario(true);
            this.modoCreacion = true;
            this.modoEdicion = false;
            this.elementos.btnAgregar.textContent = 'Cancelar';
            this.configurarBotones('creacion');
            this.elementos.campos.nombre?.focus();
        }
    }

    async guardarProducto() {
        if (this.modoEdicion) {
            await this.actualizarProducto();
        } else if (this.modoCreacion) {
            await this.crearProducto();
        } else {
            this.mostrarMensaje('Active el modo creación o edición primero', 'warning');
        }
    }

    async crearProducto() {
        const datos = this.obtenerDatosFormulario();
        console.log('📦 Datos para crear producto:', datos);
        
        if (!this.validarDatos(datos)) return;

        try {
            const response = await fetch('../controlador/Producto.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const result = await response.json();
            console.log('📬 Respuesta de creación:', result);

            if (result.success) {
                this.mostrarMensaje('Nuevo producto agregado', 'success');
                this.finalizarOperacion();
                await this.cargarProductos();
            } else {
                this.mostrarMensaje('Error: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    async actualizarProducto() {
        if (!this.productoSeleccionado?.id) {
            this.mostrarMensaje('No hay producto seleccionado para actualizar', 'warning');
            return;
        }

        const datos = this.obtenerDatosFormulario();
        console.log('📦 Datos para actualizar producto:', datos);
        
        if (!this.validarDatos(datos)) return;

        try {
            const response = await fetch(`../controlador/Producto.php?id=${this.productoSeleccionado.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const result = await response.json();
            console.log('📬 Respuesta de actualización:', result);

            if (result.success) {
                this.mostrarMensaje('Producto actualizado exitosamente', 'success');
                this.finalizarOperacion();
                await this.cargarProductos();
            } else {
                this.mostrarMensaje('Error: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    async eliminarProducto() {
        if (!this.productoSeleccionado?.id) {
            this.mostrarMensaje('Seleccione un producto para eliminar', 'warning');
            return;
        }

        const confirmacion = confirm(
            `¿Está seguro de eliminar permanentemente el producto "${this.productoSeleccionado.nombre}"?\n\n` +
            'Esta acción NO se puede deshacer. Si el producto tiene ventas asociadas, no se podrá eliminar.'
        );

        if (!confirmacion) return;

        try {
            const response = await fetch(`../controlador/Producto.php?id=${this.productoSeleccionado.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.mostrarMensaje('Producto eliminado exitosamente', 'success');
                this.finalizarOperacion();
                await this.cargarProductos();
            } else {
                this.mostrarMensaje('Error: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    finalizarOperacion() {
        this.resetearFormulario();
        this.modoCreacion = false;
        this.modoEdicion = false;
        if (this.elementos.btnAgregar) this.elementos.btnAgregar.textContent = 'Agregar Producto';
        this.configurarBotones('inicial');
    }

    obtenerDatosFormulario() {
        const datos = {
            nombre: this.elementos.campos.nombre?.value.trim() || '',
            cantidad: parseInt(this.elementos.campos.cantidad?.value) || 0,
            precio: parseFloat(this.elementos.campos.precio?.value) || 0,
            descripcion: this.elementos.campos.descripcion?.value.trim() || '',
            porcentajeIva: parseInt(this.elementos.campos.iva?.value) || 16,
            idCategoria: parseInt(this.elementos.campos.categoria?.value) || null,
            idProveedor: parseInt(this.elementos.campos.proveedor?.value) || null,
            estado: 1
        };

        console.log('📋 Datos obtenidos del formulario:', datos);
        return datos;
    }

    validarDatos(datos) {
        const { nombre, precio, idCategoria, idProveedor, descripcion, cantidad } = datos;
        
        const validaciones = [
            [!nombre, 'El nombre del producto es obligatorio'],
            [!precio || precio <= 0, 'El precio debe ser mayor a 0'],
            [!idCategoria, 'Debe seleccionar una categoría'],
            [!idProveedor, 'Debe seleccionar un proveedor'],
            [nombre.length > 100, 'El nombre no puede exceder 100 caracteres'],
            [descripcion.length > 255, 'La descripción no puede exceder 255 caracteres'],
            [precio > 999999.99, 'El precio no puede exceder 999999.99'],
            [cantidad < 0, 'La cantidad no puede ser negativa']
        ];

        for (const [condicion, mensaje] of validaciones) {
            if (condicion) {
                console.warn('⚠️ Validación fallida:', mensaje);
                this.mostrarMensaje(mensaje, 'warning');
                return false;
            }
        }
        
        console.log('✅ Validación exitosa');
        return true;
    }

    toggleFormulario(habilitar) {
        Object.values(this.elementos.campos).forEach(el => {
            if (el) el.disabled = !habilitar;
        });
    }

    resetearFormulario() {
        ['nombre', 'cantidad', 'precio', 'descripcion'].forEach(campo => {
            if (this.elementos.campos[campo]) this.elementos.campos[campo].value = '';
        });
        
        if (this.elementos.campos.iva) this.elementos.campos.iva.value = '16';
        if (this.elementos.campos.categoria) this.elementos.campos.categoria.value = '';
        if (this.elementos.campos.proveedor) this.elementos.campos.proveedor.value = ''; // Resetear proveedor
        
        this.productoSeleccionado = null;
        this.toggleFormulario(false);

        const filaSeleccionada = document.querySelector('tr.selected');
        if (filaSeleccionada) {
            filaSeleccionada.classList.remove('selected');
            const estado = this.productosData.find(p => 
                (p.idproducto == filaSeleccionada.getAttribute('data-id')) || 
                (p.idProducto == filaSeleccionada.getAttribute('data-id'))
            )?.estado;
            filaSeleccionada.style.backgroundColor = estado == 0 ? '#ffebee' : '';
        }
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        const colores = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };

        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);
        }

        notification.textContent = mensaje;
        notification.className = `notification show ${tipo}`;

        Object.assign(notification.style, {
            position: 'fixed', top: '20px', right: '20px', padding: '15px 20px',
            borderRadius: '5px', color: 'white', fontWeight: 'bold', zIndex: '1000',
            backgroundColor: colores[tipo], transform: 'translateX(0)',
            transition: 'transform 0.3s ease'
        });

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => new GestionarProductos())
    : new GestionarProductos();