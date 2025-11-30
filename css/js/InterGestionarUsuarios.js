class GestionarUsuarios {
    constructor() {
        this.usuarioSeleccionado = null;
        this.modoEdicion = false;
        this.usuariosData = [];
        this.tiposUsuario = [];
        this.init();
    }

    init() {
        this.cargarTiposUsuario();
        this.cargarUsuarios();
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
            '.btn.crear': () => this.crearUsuario(),
            '.btn.actualizar': () => this.habilitarEdicion(),
            '.btn.eliminar': () => this.eliminarUsuario(),
            '#guardar-btn': () => this.actualizarUsuario()
        };

        Object.entries(eventos).forEach(([selector, handler]) => {
            const elemento = document.querySelector(selector);
            if (elemento) elemento.addEventListener('click', handler);
        });

        const tablaUsuarios = document.getElementById('tabla-usuarios');
        if (tablaUsuarios) {
            tablaUsuarios.addEventListener('click', (e) => {
                if (e.target.tagName === 'TD') this.seleccionarFila(e.target.parentNode);
            });
        }

        const limits = { nombre: 30, apellido: 30, usuario: 15, telefono: 15 };
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
    }

    async cargarTiposUsuario() {
        try {
            const response = await fetch('../controlador/Usuario.php?action=tipos');
            const result = await response.json();

            if (result.success) {
                this.tiposUsuario = result.data;
                this.llenarSelectTipoUsuario();
            } else {
                this.mostrarMensaje('Error al cargar tipos de usuario: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión al cargar tipos: ' + error.message, 'error');
        }
    }

    llenarSelectTipoUsuario() {
        const select = document.getElementById('idTipoUsuario');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccione tipo de usuario</option>';
        this.tiposUsuario.forEach(tipo => {
            const option = document.createElement('option');
            option.value = String(tipo.idTipoUsuario || tipo.idtipousuario);
            option.textContent = tipo.descripcion || tipo.tipousuario || 'Sin nombre';
            select.appendChild(option);
        });
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

    async cargarUsuarios() {
        try {
            const response = await fetch('../controlador/Usuario.php');
            const result = await response.json();

            if (result.success) {
                this.usuariosData = result.data;
                this.mostrarUsuarios(result.data);
            } else {
                this.mostrarMensaje('Error al cargar usuarios: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    mostrarUsuarios(usuarios) {
        const tbody = document.querySelector('#tabla-usuarios tbody');
        if (!tbody) return;

        tbody.innerHTML = usuarios.map(usuario => {
            const id = usuario.idUsuario || usuario.idusuario || 'N/A';
            const estado = usuario.estado == 1 ? 'Activo' : 'Inactivo';
            const inactivo = usuario.estado == 0;
            const tipoUsuario = usuario.tipousuario || usuario.descripcion || usuario.tipoUsuario || 'Sin tipo';

            return `<tr data-id="${id}" ${inactivo ? 'style="background-color: #ffebee; color: #666;"' : ''}>
                <td>${id}</td>
                <td>${usuario.nombre || ''}</td>
                <td>${usuario.apellido || ''}</td>
                <td>${usuario.usuario || ''}</td>
                <td>${'*'.repeat((usuario.password || '').length)}</td>
                <td>${usuario.telefono || ''}</td>
                <td><span class="tipo-usuario-badge">${tipoUsuario}</span></td>
                <td><span class="estado-badge ${inactivo ? 'inactivo' : 'activo'}">${estado}</span></td>
            </tr>`;
        }).join('');
    }

    seleccionarFila(fila) {
        document.querySelector('tr.selected')?.classList.remove('selected');
        fila.classList.add('selected');

        const idUsuario = parseInt(fila.getAttribute('data-id'));
        const usuarioCompleto = this.usuariosData.find(u => (u.idUsuario == idUsuario) || (u.idusuario == idUsuario));

        if (!usuarioCompleto) return;

        this.usuarioSeleccionado = {
            id: usuarioCompleto.idUsuario || usuarioCompleto.idusuario,
            nombre: usuarioCompleto.nombre || '',
            apellido: usuarioCompleto.apellido || '',
            usuario: usuarioCompleto.usuario || '',
            password: usuarioCompleto.password || '',
            telefono: usuarioCompleto.telefono || '',
            idTipoUsuario: usuarioCompleto.idTipoUsuario || usuarioCompleto.idtipousuario || '',
            estado: usuarioCompleto.estado !== undefined ? usuarioCompleto.estado : 1
        };

        this.llenarFormulario(this.usuarioSeleccionado);
        this.configurarBotones('seleccion');
    }

    llenarFormulario(usuario) {
        ['nombre', 'apellido', 'usuario', 'password', 'telefono'].forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) elemento.value = usuario[campo] || '';
        });

        const selectTipo = document.getElementById('idTipoUsuario');
        if (selectTipo && usuario.idTipoUsuario) selectTipo.value = String(usuario.idTipoUsuario);

        const selectEstado = document.getElementById('estado');
        if (selectEstado && usuario) {
            this.llenarSelectEstado();
            selectEstado.value = String(usuario.estado !== undefined ? usuario.estado : 1);
            selectEstado.disabled = true;
        }
    }

    limpiarFormulario() {
        ['nombre', 'apellido', 'usuario', 'password', 'telefono'].forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) elemento.value = '';
        });

        const selectTipo = document.getElementById('idTipoUsuario');
        if (selectTipo) selectTipo.value = '';

        const selectEstado = document.getElementById('estado');
        if (selectEstado) {
            selectEstado.innerHTML = '<option value="">Seleccione estado</option>';
            selectEstado.disabled = true;
        }

        this.usuarioSeleccionado = null;
        this.modoEdicion = false;
        this.configurarBotones('crear');
        document.querySelector('tr.selected')?.classList.remove('selected');
    }

    habilitarEdicion() {
        if (!this.usuarioSeleccionado) {
            this.mostrarMensaje('Seleccione un usuario para actualizar', 'warning');
            return;
        }

        this.modoEdicion = true;
        
        const selectEstado = document.getElementById('estado');
        if (selectEstado) {
            selectEstado.disabled = false;
            this.llenarSelectEstado();
            selectEstado.value = String(this.usuarioSeleccionado.estado !== undefined ? this.usuarioSeleccionado.estado : 1);
        }

        this.configurarBotones('edicion');
        this.mostrarMensaje('Modo edición activado. Puede modificar el estado del usuario.', 'info');
        const nombreInput = document.getElementById('nombre');
        if (nombreInput) nombreInput.focus();
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
                    if (valor && !this.usuarioSeleccionado) {
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

    async crearUsuario() {
        if (this.modoEdicion) {
            this.cancelarEdicion();
            return;
        }

        const datos = this.obtenerDatosFormulario();
        if (!this.validarDatos(datos)) return;

        datos.estado = 1;
        await this.peticionHTTP('POST', '../controlador/Usuario.php', datos);
    }

    async actualizarUsuario() {
        if (!this.usuarioSeleccionado?.id) {
            this.mostrarMensaje('No hay usuario seleccionado para actualizar', 'warning');
            return;
        }

        const datos = this.obtenerDatosFormulario();
        if (!this.validarDatos(datos)) return;

        await this.peticionHTTP('PUT', `../controlador/Usuario.php?id=${this.usuarioSeleccionado.id}`, datos);
    }

    async eliminarUsuario() {
        if (!this.usuarioSeleccionado?.id) {
            this.mostrarMensaje('Seleccione un usuario para eliminar', 'warning');
            return;
        }

        if (!confirm('¿Está seguro de eliminar permanentemente este usuario de la base de datos?\n\nEsta acción NO se puede deshacer.')) return;

        await this.peticionHTTP('DELETE', `../controlador/Usuario.php?id=${this.usuarioSeleccionado.id}`);
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
                this.cargarUsuarios();
            } else {
                this.mostrarMensaje('Error: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    cancelarEdicion() {
        if (this.usuarioSeleccionado) this.llenarFormulario(this.usuarioSeleccionado);
        this.modoEdicion = false;
        this.configurarBotones('seleccion');
        this.mostrarMensaje('Edición cancelada', 'info');
    }

    obtenerDatosFormulario() {
        const campos = ['nombre', 'apellido', 'usuario', 'password', 'telefono'];
        let datos = {};

        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            datos[campo] = elemento ? elemento.value.trim() : '';
        });

        const selectTipo = document.getElementById('idTipoUsuario');
        const tipoUsuarioValue = selectTipo ? selectTipo.value : '';
        datos.idTipoUsuario = tipoUsuarioValue && !isNaN(tipoUsuarioValue) ? parseInt(tipoUsuarioValue) : null;

        const selectEstado = document.getElementById('estado');
        if (this.modoEdicion && selectEstado && !selectEstado.disabled && selectEstado.value !== '') {
            datos.estado = parseInt(selectEstado.value);
        } else {
            datos.estado = 1;
        }

        return datos;
    }

    validarDatos(datos) {
        const { nombre, apellido, usuario, password, telefono, idTipoUsuario } = datos;

        if (!nombre || !apellido || !usuario || !password || !telefono) {
            this.mostrarMensaje('Los campos nombre, apellido, usuario, password y teléfono son obligatorios', 'warning');
            return false;
        }

        if (!idTipoUsuario) {
            this.mostrarMensaje('Debe seleccionar un tipo de usuario', 'warning');
            return false;
        }

        const validaciones = [
            [nombre.length > 30 || apellido.length > 30, 'Nombre y apellido no pueden exceder 30 caracteres'],
            [usuario.length > 15 || telefono.length > 15, 'Usuario y teléfono no pueden exceder 15 caracteres'],
            [password.length > 255, 'La contraseña no puede exceder 255 caracteres']
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

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => new GestionarUsuarios())
    : new GestionarUsuarios();