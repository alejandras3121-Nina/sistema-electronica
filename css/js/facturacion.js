async function cargarClientes() {
    const selectCliente = document.getElementById('selectCliente');
    
    try {
        selectCliente.innerHTML = '<option value="">Cargando clientes...</option>';
        selectCliente.disabled = true;
        
        const response = await fetch('../controlador/getClientes.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            selectCliente.innerHTML = '<option value="">Seleccione cliente...</option>';
            
            data.data.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nombre_completo;
                option.setAttribute('data-cedula', cliente.cedula);
                option.setAttribute('data-telefono', cliente.telefono);
                option.setAttribute('data-direccion', cliente.direccion);
                selectCliente.appendChild(option);
            });
            
            selectCliente.disabled = false;
            
        } else {
            throw new Error(data.message || 'Error al cargar los clientes');
        }
        
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        selectCliente.innerHTML = '<option value="">Error al cargar clientes</option>';
        selectCliente.disabled = true;
        mostrarNotificacion('Error al cargar los clientes: ' + error.message, 'error');
    }
}

async function cargarProductos() {
    const selectProducto = document.getElementById('selectProducto');
    
    try {
        selectProducto.innerHTML = '<option value="">Cargando productos...</option>';
        selectProducto.disabled = true;
        
        const response = await fetch('../controlador/getProductos.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            selectProducto.innerHTML = '<option value="">Seleccione producto...</option>';
            
            data.data.forEach(producto => {
                const option = document.createElement('option');
                option.value = producto.id;
                option.textContent = `${producto.nombre} - $${producto.precio} (Stock: ${producto.cantidad})`;
                option.setAttribute('data-nombre', producto.nombre);
                option.setAttribute('data-precio', producto.precio);
                option.setAttribute('data-stock', producto.cantidad);
                option.setAttribute('data-iva', producto.porcentajeIva);
                option.setAttribute('data-descripcion', producto.descripcion);
                selectProducto.appendChild(option);
            });
            
            selectProducto.disabled = false;
            
        } else {
            throw new Error(data.message || 'Error al cargar los productos');
        }
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        selectProducto.innerHTML = '<option value="">Error al cargar productos</option>';
        selectProducto.disabled = true;
        mostrarNotificacion('Error al cargar los productos: ' + error.message, 'error');
    }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            display: none;
        `;
        document.body.appendChild(notification);
    }
    
    const colores = {
        'info': '#3498db',
        'success': '#2ecc71',
        'warning': '#f39c12',
        'error': '#e74c3c'
    };
    
    notification.textContent = mensaje;
    notification.style.backgroundColor = colores[tipo] || colores.info;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

function abrirSelect(selectElement) {
    selectElement.focus();
    const event = new MouseEvent('mousedown', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    selectElement.dispatchEvent(event);

    setTimeout(() => {
        selectElement.focus();
    }, 10);
}

function filtrarClientes() {
    const inputBuscar = document.getElementById('buscarCliente');
    if (!inputBuscar) return;

    const termino = inputBuscar.value.toLowerCase().trim();
    const selectCliente = document.getElementById('selectCliente');
    if (!selectCliente) return;

    const opciones = selectCliente.querySelectorAll('option');
    let hayResultados = false;

    const mensajeAnterior = selectCliente.querySelector('.no-resultados');
    if (mensajeAnterior) mensajeAnterior.remove();

    opciones.forEach(opcion => {
        if (opcion.value === '') {
            opcion.style.display = termino.length === 0 ? 'block' : 'none';
            return;
        }

        const textoOpcion = opcion.textContent.toLowerCase();
        if (termino.length === 0 || textoOpcion.includes(termino)) {
            opcion.style.display = 'block';
            hayResultados = true;
        } else {
            opcion.style.display = 'none';
        }
    });

    if (termino.length > 0 && !hayResultados) {
        const optionNoResultados = document.createElement('option');
        optionNoResultados.value = '';
        optionNoResultados.textContent = '❌ No se encontraron clientes';
        optionNoResultados.disabled = true;
        optionNoResultados.className = 'no-resultados';
        optionNoResultados.style.color = '#e74c3c';
        optionNoResultados.style.fontStyle = 'italic';
        selectCliente.appendChild(optionNoResultados);
    }
}

function filtrarProductos() {
    const inputBuscar = document.getElementById('buscarProducto');
    if (!inputBuscar) return;
    
    const termino = inputBuscar.value.toLowerCase().trim();
    const selectProducto = document.getElementById('selectProducto');
    if (!selectProducto) return;

    
    const opciones = selectProducto.querySelectorAll('option');
    let hayResultados = false;

    const mensajeAnterior = selectProducto.querySelector('.no-resultados');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
    
    opciones.forEach(opcion => {
        if (opcion.value === '') {

            opcion.style.display = termino.length === 0 ? 'block' : 'none';
            return;
        }
        
        const textoOpcion = opcion.textContent.toLowerCase();
        if (termino.length === 0 || textoOpcion.includes(termino)) {
            opcion.style.display = 'block';
            hayResultados = true;
        } else {
            opcion.style.display = 'none';
        }
    });

    if (termino.length > 0 && !hayResultados) {
        const optionNoResultados = document.createElement('option');
        optionNoResultados.value = '';
        optionNoResultados.textContent = '❌ No se encontraron productos';
        optionNoResultados.disabled = true;
        optionNoResultados.className = 'no-resultados';
        optionNoResultados.style.color = '#e74c3c';
        optionNoResultados.style.fontStyle = 'italic';
        selectProducto.appendChild(optionNoResultados);
    }
}

function limpiarFiltroClientes() {
    const inputBuscar = document.getElementById('buscarCliente');
    if (inputBuscar) {
        inputBuscar.value = '';
    }
    
    const selectCliente = document.getElementById('selectCliente');
    if (!selectCliente) return;

    const mensajeNoResultados = selectCliente.querySelector('.no-resultados');
    if (mensajeNoResultados) {
        mensajeNoResultados.remove();
    }

    const opciones = selectCliente.querySelectorAll('option');
    opciones.forEach(opcion => {
        opcion.style.display = 'block';
    });
}

function limpiarFiltroProductos() {
    const inputBuscar = document.getElementById('buscarProducto');
    if (inputBuscar) {
        inputBuscar.value = '';
    }
    
    const selectProducto = document.getElementById('selectProducto');
    if (!selectProducto) return;

    const mensajeNoResultados = selectProducto.querySelector('.no-resultados');
    if (mensajeNoResultados) {
        mensajeNoResultados.remove();
    }
    const opciones = selectProducto.querySelectorAll('option');
    opciones.forEach(opcion => {
        opcion.style.display = 'block';
    });
}


document.addEventListener('DOMContentLoaded', function() {

    cargarClientes();
    cargarProductos();
    
    const buscarCliente = document.getElementById('buscarCliente');
    const buscarProducto = document.getElementById('buscarProducto');
    
    if (buscarCliente) {

        let timeoutCliente;
        buscarCliente.addEventListener('input', function() {
            clearTimeout(timeoutCliente);
            timeoutCliente = setTimeout(() => {
                filtrarClientes();
            }, 100);
        });
                const btnBuscarCliente = buscarCliente.parentElement.querySelector('.btn.buscar');
        if (btnBuscarCliente) {
            btnBuscarCliente.addEventListener('click', function() {
                limpiarFiltroClientes();
            });
        }
    }
    
    if (buscarProducto) {

        let timeoutProducto;
        buscarProducto.addEventListener('input', function() {
            clearTimeout(timeoutProducto);
            timeoutProducto = setTimeout(() => {
                filtrarProductos();
            }, 100); 
        });
        
        const btnBuscarProducto = buscarProducto.parentElement.querySelector('.btn.buscar');
        if (btnBuscarProducto) {
            btnBuscarProducto.addEventListener('click', function() {
                limpiarFiltroProductos();
            });
        }
    }
});