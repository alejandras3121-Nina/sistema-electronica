class GestionarProveedores {
    constructor() {
        this.proveedorSeleccionado = null;
        this.modoEdicion = false;
        this.proveedoresData = [];
        this.init();
    }

    init() {
        this.cargarProveedores();
        this.configurarEventos();
        this.inicializarSelectEstado();
    }

    inicializarSelectEstado() {
        const selectEstado = document.getElementById('estado');
        if (selectEstado) {
            selectEstado.innerHTML = '<option value="">Seleccione estado</option>';
            selectEstado.disabled = true;
        }
    }

    configurarEventos() {
        const eventos = {
            '.btn.crear': () => this.crearProveedor(),
            '.btn.actualizar': () => this.habilitarEdicion(),
            '.btn.eliminar': () => this.eliminarProveedor(),
            '#guardar-btn': () => this.actualizarProveedor()
        };

        Object.entries(eventos).forEach(([selector, handler]) => {
            const elemento = document.querySelector(selector);
            if (elemento) elemento.addEventListener('click', handler);
        });

        const tablaProveedores = document.getElementById('tabla-proveedores');
        if (tablaProveedores) {
            tablaProveedores.addEventListener('click', (e) => {
                if (e.target.tagName === 'TD') this.seleccionarFila(e.target.parentNode);
            });
        }

        // Configurar límites de caracteres basados en la base de datos
        const limits = { 
            nombreEmpresa: 100, 
            nombreContacto: 50, 
            telefono: 15, 
            direccion: 100, 
            correo: 100 
        };
        
        Object.entries(limits).forEach(([field, limit]) => {
            const elemento = document.getElementById(field);
            if (elemento) {
                elemento.addEventListener('input', (e) => {
                    if (e.target.value.length > limit) {
                        e.target.value = e.target.value.substring(0, limit);
                        this.mostrarMensaje(`El ${field} no puede exceder ${limit} caracteres`, 'warning');
                    }
                });
            }
        });

        // Validación específica para correo electrónico
        const correoInput = document.getElementById('correo');
        if (correoInput) {
            correoInput.addEventListener('blur', (e) => {
                const email = e.target.value.trim();
                if (email && !this.validarEmail(email)) {
                    this.mostrarMensaje('Por favor ingrese un correo electrónico válido', 'warning');
                    e.target.focus();
                }
            });
        }
    }

    normalizarEstado(estado) {
        // Convertir diferentes formatos de estado a número
        if (typeof estado === 'boolean') {
            return estado ? 1 : 0;
        }
        if (estado === 'Activo' || estado === 'activo') {
            return 1;
        }
        if (estado === 'Inactivo' || estado === 'inactivo') {
            return 0;
        }
        return estado !== undefined ? parseInt(estado) : 1;
    }

    validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async cargarProveedores() {
        try {
            console.log('Cargando proveedores...');
            const response = await fetch('../controlador/Proveedor.php');
            const result = await response.json();

            // Debug: Mostrar la respuesta completa
            console.log('Respuesta del servidor:', result);

            if (result.success) {
                this.proveedoresData = result.data;
                console.log('Datos de proveedores cargados:', this.proveedoresData);
                
                // Debug: Mostrar estructura del primer proveedor si existe
                if (this.proveedoresData.length > 0) {
                    console.log('Estructura del primer proveedor:', this.proveedoresData[0]);
                    console.log('Claves disponibles:', Object.keys(this.proveedoresData[0]));
                }
                
                this.mostrarProveedores(result.data);
            } else {
                console.error('Error en la respuesta:', result.message);
                this.mostrarMensaje('Error al cargar proveedores: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    mostrarProveedores(proveedores) {
        const tbody = document.querySelector('#tabla-proveedores tbody');
        if (!tbody) {
            console.error('No se encontró el tbody de la tabla');
            return;
        }

        console.log('Mostrando proveedores en tabla:', proveedores);

        tbody.innerHTML = proveedores.map(proveedor => {
            // Debug: Mostrar cada proveedor individualmente
            console.log('Procesando proveedor:', proveedor);
            
            // Intentar diferentes variaciones de nombres de campos
            const id = proveedor.idProveedor || proveedor.idproveedor || proveedor.id || 'N/A';
            const nombreEmpresa = proveedor.nombreEmpresa || proveedor.nombreempresa || proveedor.nombre_empresa || proveedor.empresa || proveedor.nombre || '';
            const nombreContacto = proveedor.nombreContacto || proveedor.nombrecontacto || proveedor.nombre_contacto || proveedor.contacto || '';
            const telefono = proveedor.telefono || proveedor.phone || '';
            const direccion = proveedor.direccion || proveedor.address || '';
            const correo = proveedor.correo || proveedor.email || '';
            
            // Manejar estado que puede ser string o boolean
            let estadoTexto, inactivo;
            if (typeof proveedor.estado === 'boolean') {
                estadoTexto = proveedor.estado ? 'Activo' : 'Inactivo';
                inactivo = !proveedor.estado;
            } else {
                estadoTexto = proveedor.estado == 1 || proveedor.estado === 'Activo' ? 'Activo' : 'Inactivo';
                inactivo = proveedor.estado == 0 || proveedor.estado === 'Inactivo';
            }

            // Debug: Mostrar los valores extraídos
            console.log(`Proveedor ${id}:`, {
                nombreEmpresa,
                nombreContacto,
                telefono,
                direccion,
                correo,
                estado: estadoTexto
            });

            return `<tr data-id="${id}" ${inactivo ? 'style="background-color: #ffebee; color: #666;"' : ''}>
                <td>${id}</td>
                <td>${nombreEmpresa}</td>
                <td>${nombreContacto}</td>
                <td>${telefono}</td>
                <td>${direccion}</td>
                <td>${correo}</td>
                <td><span class="estado-badge ${inactivo ? 'inactivo' : 'activo'}">${estadoTexto}</span></td>
            </tr>`;
        }).join('');

        console.log('Tabla actualizada con', proveedores.length, 'proveedores');
    }

    seleccionarFila(fila) {
        document.querySelector('tr.selected')?.classList.remove('selected');
        fila.classList.add('selected');

        const idProveedor = parseInt(fila.getAttribute('data-id'));
        console.log('Seleccionando proveedor con ID:', idProveedor);
        
        const proveedorCompleto = this.proveedoresData.find(p => 
            (p.idProveedor == idProveedor) || (p.idproveedor == idProveedor) || (p.id == idProveedor)
        );

        console.log('Proveedor encontrado:', proveedorCompleto);

        if (!proveedorCompleto) {
            console.error('No se encontró el proveedor con ID:', idProveedor);
            return;
        }

        this.proveedorSeleccionado = {
            id: proveedorCompleto.idProveedor || proveedorCompleto.idproveedor || proveedorCompleto.id,
            nombreEmpresa: proveedorCompleto.nombreEmpresa || proveedorCompleto.nombreempresa || proveedorCompleto.nombre_empresa || proveedorCompleto.empresa || proveedorCompleto.nombre || '',
            nombreContacto: proveedorCompleto.nombreContacto || proveedorCompleto.nombrecontacto || proveedorCompleto.nombre_contacto || proveedorCompleto.contacto || '',
            telefono: proveedorCompleto.telefono || proveedorCompleto.phone || '',
            direccion: proveedorCompleto.direccion || proveedorCompleto.address || '',
            correo: proveedorCompleto.correo || proveedorCompleto.email || '',
            estado: this.normalizarEstado(proveedorCompleto.estado)
        };

        console.log('Proveedor seleccionado normalizado:', this.proveedorSeleccionado);

        this.llenarFormulario(this.proveedorSeleccionado);
        this.configurarBotones('seleccion');
    }

    llenarFormulario(proveedor) {
        console.log('Llenando formulario con:', proveedor);
        
        ['nombreEmpresa', 'nombreContacto', 'telefono', 'direccion', 'correo'].forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) {
                elemento.value = proveedor[campo] || '';
                console.log(`Campo ${campo} llenado con: "${proveedor[campo] || ''}"`);
            } else {
                console.error(`Elemento ${campo} no encontrado en el DOM`);
            }
        });

        const selectEstado = document.getElementById('estado');
        if (selectEstado && proveedor) {
            this.llenarSelectEstado();
            selectEstado.value = String(proveedor.estado !== undefined ? proveedor.estado : 1);
            selectEstado.disabled = true;
        }
    }

    llenarSelectEstado() {
        const select = document.getElementById('estado');
        if (!select || select.children.length > 1) return;

        select.innerHTML = '';
        const opciones = [{ value: '1', text: 'Activo' }, { value: '0', text: 'Inactivo' }];
        opciones.forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion.value;
            option.textContent = opcion.text;
            select.appendChild(option);
        });
    }

    limpiarFormulario() {
        ['nombreEmpresa', 'nombreContacto', 'telefono', 'direccion', 'correo'].forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) elemento.value = '';
        });

        const selectEstado = document.getElementById('estado');
        if (selectEstado) {
            selectEstado.innerHTML = '<option value="">Seleccione estado</option>';
            selectEstado.disabled = true;
        }

        this.proveedorSeleccionado = null;
        this.modoEdicion = false;
        this.configurarBotones('crear');
        document.querySelector('tr.selected')?.classList.remove('selected');
    }

    habilitarEdicion() {
        if (!this.proveedorSeleccionado) {
            this.mostrarMensaje('Seleccione un proveedor para actualizar', 'warning');
            return;
        }

        this.modoEdicion = true;
        
        const selectEstado = document.getElementById('estado');
        if (selectEstado) {
            selectEstado.disabled = false;
            this.llenarSelectEstado();
            selectEstado.value = String(this.proveedorSeleccionado.estado !== undefined ? this.proveedorSeleccionado.estado : 1);
        }

        this.configurarBotones('edicion');
        this.mostrarMensaje('Modo edición activado. Puede modificar el estado del proveedor.', 'info');
        const nombreEmpresaInput = document.getElementById('nombreEmpresa');
        if (nombreEmpresaInput) nombreEmpresaInput.focus();
    }

    configurarBotones(modo) {
        const botones = {
            crear: document.querySelector('.btn.crear'),
            actualizar: document.querySelector('.btn.actualizar'),
            eliminar: document.querySelector('.btn.eliminar'),
            guardar: document.getElementById('guardar-btn')
        };

        const selectEstado = document.getElementById('estado');
        
        const configs = {
            crear: { crear: ['Crear', false], actualizar: [null, true], eliminar: [null, true], guardar: [null, true], estadoDisabled: true },
            seleccion: { crear: ['Crear', false], actualizar: [null, false], eliminar: [null, false], guardar: [null, true], estadoDisabled: true },
            edicion: { crear: ['Cancelar', false], actualizar: [null, true], eliminar: [null, true], guardar: [null, false], estadoDisabled: false }
        };

        const config = configs[modo];
        
        Object.entries(config).forEach(([boton, valor]) => {
            if (boton === 'estadoDisabled') {
                if (selectEstado) {
                    selectEstado.disabled = valor;
                    if (valor && !this.proveedorSeleccionado) {
                        selectEstado.innerHTML = '<option value="">Seleccione estado</option>';
                    }
                }
            } else if (botones[boton]) {
                const [texto, disabled] = valor;
                if (texto) botones[boton].textContent = texto;
                botones[boton].disabled = disabled;
            }
        });
    }

    async crearProveedor() {
        if (this.modoEdicion) {
            this.cancelarEdicion();
            return;
        }

        const datos = this.obtenerDatosFormulario();
        if (!this.validarDatos(datos)) return;

        datos.estado = 1;
        await this.peticionHTTP('POST', '../controlador/Proveedor.php', datos);
    }

    async actualizarProveedor() {
        if (!this.proveedorSeleccionado?.id) {
            this.mostrarMensaje('No hay proveedor seleccionado para actualizar', 'warning');
            return;
        }

        const datos = this.obtenerDatosFormulario();
        if (!this.validarDatos(datos)) return;

        await this.peticionHTTP('PUT', `../controlador/Proveedor.php?id=${this.proveedorSeleccionado.id}`, datos);
    }

    async eliminarProveedor() {
        if (!this.proveedorSeleccionado?.id) {
            this.mostrarMensaje('Seleccione un proveedor para eliminar', 'warning');
            return;
        }

        if (!confirm('¿Está seguro de eliminar permanentemente este proveedor de la base de datos?\n\nEsta acción NO se puede deshacer.')) return;

        await this.peticionHTTP('DELETE', `../controlador/Proveedor.php?id=${this.proveedorSeleccionado.id}`);
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
                this.cargarProveedores();
            } else {
                this.mostrarMensaje('Error: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    cancelarEdicion() {
        if (this.proveedorSeleccionado) this.llenarFormulario(this.proveedorSeleccionado);
        this.modoEdicion = false;
        this.configurarBotones('seleccion');
        this.mostrarMensaje('Edición cancelada', 'info');
    }

    obtenerDatosFormulario() {
        const campos = ['nombreEmpresa', 'nombreContacto', 'telefono', 'direccion', 'correo'];
        let datos = {};

        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            datos[campo] = elemento ? elemento.value.trim() : '';
        });

        const selectEstado = document.getElementById('estado');
        if (this.modoEdicion && selectEstado && !selectEstado.disabled && selectEstado.value !== '') {
            datos.estado = parseInt(selectEstado.value);
        } else {
            datos.estado = 1;
        }

        return datos;
    }

    validarDatos(datos) {
        const { nombreEmpresa, nombreContacto, telefono, direccion, correo } = datos;

        if (!nombreEmpresa || !nombreContacto || !telefono || !direccion || !correo) {
            this.mostrarMensaje('Todos los campos son obligatorios', 'warning');
            return false;
        }

        if (!this.validarEmail(correo)) {
            this.mostrarMensaje('Por favor ingrese un correo electrónico válido', 'warning');
            return false;
        }

        const validaciones = [
            [nombreEmpresa.length > 100, 'El nombre de la empresa no puede exceder 100 caracteres'],
            [nombreContacto.length > 50, 'El nombre del contacto no puede exceder 50 caracteres'],
            [telefono.length > 15, 'El teléfono no puede exceder 15 caracteres'],
            [direccion.length > 100, 'La dirección no puede exceder 100 caracteres'],
            [correo.length > 100, 'El correo no puede exceder 100 caracteres']
        ];

        for (const [condicion, mensaje] of validaciones) {
            if (condicion) {
                this.mostrarMensaje(mensaje, 'warning');
                return false;
            }
        }

        return true;
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        document.querySelector('.mensaje')?.remove();

        const colores = { success: '#4CAF50', error: '#f44336', warning: '#ff9800', info: '#2196F3' };

        const div = document.createElement('div');
        Object.assign(div, { className: `mensaje ${tipo}`, textContent: mensaje });

        Object.assign(div.style, {
            position: 'fixed', top: '20px', right: '20px', padding: '10px 15px',
            borderRadius: '5px', color: 'white', fontWeight: 'bold', zIndex: '1000',
            maxWidth: '300px', backgroundColor: colores[tipo]
        });

        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    }
}

// Inicializar cuando el DOM esté listo
document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => new GestionarProveedores())
    : new GestionarProveedores();