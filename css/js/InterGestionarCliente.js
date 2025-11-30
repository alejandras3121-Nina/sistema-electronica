class GestionarClientes {
    constructor() {
        this.clienteSeleccionado = null;
        this.modoEdicion = false;
        this.clientesData = [];
        this.init();
    }

    init() {
        this.cargarClientes();
        this.configurarEventos();
    }

    configurarEventos() {
        document.getElementById('cliente-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.modoEdicion) this.crearCliente();
        });

        document.getElementById('actualizar-btn').addEventListener('click', () => this.habilitarEdicion());
        document.getElementById('guardar-btn').addEventListener('click', () => this.actualizarCliente());
        document.getElementById('cancelar-btn').addEventListener('click', () => this.cancelarEdicion());
        document.getElementById('eliminar-btn').addEventListener('click', () => this.eliminarCliente());

        document.getElementById('clientes-table').addEventListener('click', (e) => {
            if (e.target.tagName === 'TD') {
                this.seleccionarFila(e.target.parentNode);
            }
        });
    }

    async cargarClientes() {
        try {
            const response = await fetch('../modelo/Cliente.php');
            const result = await response.json();

            if (result.success) {
                this.clientesData = result.data;
                this.mostrarClientes(result.data);
                console.log('Clientes cargados:', result.data);
            } else {
                this.mostrarMensaje('Error al cargar clientes: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
            console.error('Error completo:', error);
        }
    }

    mostrarClientes(clientes) {
        const tbody = document.querySelector('#clientes-table tbody');
        tbody.innerHTML = '';

        clientes.forEach((cliente) => {
            console.log('Procesando cliente:', cliente);
            
            const fila = document.createElement('tr');
            fila.setAttribute('data-id', cliente.idcliente || cliente.idCliente);

            const id = cliente.idcliente || cliente.idCliente || 'N/A';
            const nombre = cliente.nombre || '';
            const apellido = cliente.apellido || '';
            const cedula = cliente.cedula || '';
            const telefono = cliente.telefono || '';
            const direccion = cliente.direccion || '';
            const estado = cliente.estado == 1 ? 'Activo' : 'Inactivo';

            // Aplicar estilo diferente según el estado
            if (cliente.estado == 0) {
                fila.style.backgroundColor = '#ffebee';
                fila.style.color = '#666';
            }

            fila.innerHTML = `
                <td>${id}</td>
                <td>${nombre}</td>
                <td>${apellido}</td>
                <td>${cedula}</td>
                <td>${telefono}</td>
                <td>${direccion}</td>
                <td><span class="estado-badge ${cliente.estado == 1 ? 'activo' : 'inactivo'}">${estado}</span></td>
            `;

            tbody.appendChild(fila);
        });
    }

    seleccionarFila(fila) {
        const filaAnterior = document.querySelector('tr.selected');
        if (filaAnterior) filaAnterior.classList.remove('selected');

        fila.classList.add('selected');

        const idCliente = parseInt(fila.getAttribute('data-id'));
        const clienteCompleto = this.clientesData.find(c => 
            (c.idcliente == idCliente) || (c.idCliente == idCliente)
        );

        console.log('Cliente seleccionado ID:', idCliente);
        console.log('Cliente encontrado:', clienteCompleto);

        if (!clienteCompleto) {
            console.error('No se encontró el cliente con ID:', idCliente);
            return;
        }

        this.clienteSeleccionado = {
            id: clienteCompleto.idcliente || clienteCompleto.idCliente,
            nombre: clienteCompleto.nombre || '',
            apellido: clienteCompleto.apellido || '',
            cedula: clienteCompleto.cedula || '',
            telefono: clienteCompleto.telefono || '',
            direccion: clienteCompleto.direccion || '',
            estado: clienteCompleto.estado || 1
        };

        this.llenarFormulario(this.clienteSeleccionado);
        this.configurarBotones('seleccion');
    }

    llenarFormulario(cliente) {
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('apellido').value = cliente.apellido;
        document.getElementById('cedula').value = cliente.cedula;
        document.getElementById('telefono').value = cliente.telefono;
        document.getElementById('direccion').value = cliente.direccion;
        document.getElementById('estado').value = cliente.estado;
    }

    limpiarFormulario() {
        document.getElementById('cliente-form').reset();
        document.getElementById('estado').value = '1'; // Por defecto Activo
        this.clienteSeleccionado = null;
        this.modoEdicion = false;
        this.configurarBotones('crear');

        const filaSeleccionada = document.querySelector('tr.selected');
        if (filaSeleccionada) filaSeleccionada.classList.remove('selected');
    }

    habilitarEdicion() {
        if (!this.clienteSeleccionado) {
            this.mostrarMensaje('Seleccione un cliente para actualizar', 'warning');
            return;
        }

        this.modoEdicion = true;
        this.configurarBotones('edicion');
        this.mostrarMensaje('Modo edición activado. Modifique los datos y haga clic en "Guardar Cambios"', 'info');
        document.getElementById('nombre').focus();
    }

    cancelarEdicion() {
        if (this.clienteSeleccionado) this.llenarFormulario(this.clienteSeleccionado);
        this.modoEdicion = false;
        this.configurarBotones('seleccion');
        this.mostrarMensaje('Edición cancelada', 'info');
    }

    configurarBotones(modo) {
        const crearBtn = document.getElementById('crear-btn');
        const actualizarBtn = document.getElementById('actualizar-btn');
        const guardarBtn = document.getElementById('guardar-btn');
        const cancelarBtn = document.getElementById('cancelar-btn');
        const eliminarBtn = document.getElementById('eliminar-btn');

        switch (modo) {
            case 'crear':
                crearBtn.disabled = false;
                actualizarBtn.disabled = true;
                guardarBtn.disabled = true;
                cancelarBtn.disabled = true;
                eliminarBtn.disabled = true;
                break;
            case 'seleccion':
                crearBtn.disabled = false;
                actualizarBtn.disabled = false;
                guardarBtn.disabled = true;
                cancelarBtn.disabled = true;
                eliminarBtn.disabled = false;
                break;
            case 'edicion':
                crearBtn.disabled = true;
                actualizarBtn.disabled = true;
                guardarBtn.disabled = false;
                cancelarBtn.disabled = false;
                eliminarBtn.disabled = true;
                break;
        }
    }

    async crearCliente() {
        const datos = this.obtenerDatosFormulario();
        if (!this.validarDatos(datos)) return;

        try {
            const response = await fetch('../modelo/Cliente.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const result = await response.json();
            if (result.success) {
                this.mostrarMensaje(result.message, 'success');
                this.limpiarFormulario();
                this.cargarClientes();
            } else {
                this.mostrarMensaje('Error: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    async actualizarCliente() {
        if (!this.clienteSeleccionado || !this.clienteSeleccionado.id) {
            this.mostrarMensaje('No hay cliente seleccionado para actualizar', 'warning');
            return;
        }

        const datos = this.obtenerDatosFormulario();
        if (!this.validarDatos(datos)) return;

        try {
            const response = await fetch(`../modelo/Cliente.php?id=${this.clienteSeleccionado.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const result = await response.json();
            if (result.success) {
                this.mostrarMensaje(result.message, 'success');
                this.limpiarFormulario();
                this.cargarClientes();
            } else {
                this.mostrarMensaje('Error: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    async eliminarCliente() {
        if (!this.clienteSeleccionado || !this.clienteSeleccionado.id) {
            this.mostrarMensaje('Seleccione un cliente para eliminar', 'warning');
            return;
        }

        if (!confirm('¿Está seguro de eliminar permanentemente este cliente de la base de datos?\n\nEsta acción NO se puede deshacer. Si el cliente tiene ventas asociadas, no se podrá eliminar.')) {
            return;
        }

        try {
            const response = await fetch(`../modelo/Cliente.php?id=${this.clienteSeleccionado.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                this.mostrarMensaje(result.message, 'success');
                this.limpiarFormulario();
                this.cargarClientes();
            } else {
                this.mostrarMensaje('Error: ' + result.message, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    }

    obtenerDatosFormulario() {
        return {
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            cedula: document.getElementById('cedula').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            direccion: document.getElementById('direccion').value.trim(),
            estado: document.getElementById('estado').value
        };
    }

    validarDatos(datos) {
        if (!datos.nombre || !datos.apellido || !datos.cedula || !datos.telefono || !datos.direccion) {
            this.mostrarMensaje('Todos los campos son obligatorios', 'warning');
            return false;
        }

        if (datos.nombre.length > 30 || datos.apellido.length > 30) {
            this.mostrarMensaje('Nombre y apellido no pueden exceder 30 caracteres', 'warning');
            return false;
        }

        if (datos.cedula.length > 15 || datos.telefono.length > 15) {
            this.mostrarMensaje('Cédula y teléfono no pueden exceder 15 caracteres', 'warning');
            return false;
        }

        if (datos.direccion.length > 100) {
            this.mostrarMensaje('La dirección no puede exceder 100 caracteres', 'warning');
            return false;
        }

        return true;
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        const mensajeAnterior = document.querySelector('.mensaje');
        if (mensajeAnterior) mensajeAnterior.remove();

        const div = document.createElement('div');
        div.className = `mensaje ${tipo}`;
        div.textContent = mensaje;

        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
        `;

        switch (tipo) {
            case 'success':
                div.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                div.style.backgroundColor = '#f44336';
                break;
            case 'warning':
                div.style.backgroundColor = '#ff9800';
                break;
            default:
                div.style.backgroundColor = '#2196F3';
        }

        document.body.appendChild(div);

        setTimeout(() => {
            if (div.parentNode) div.remove();
        }, 4000);
    }
}

// Inicializar al cargar DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new GestionarClientes());
} else {
    new GestionarClientes();
}