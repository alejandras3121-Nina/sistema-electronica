// Función para cargar las categorías al combo box
async function cargarCategorias() {
    const selectCategoria = document.getElementById('categoria');
    
    try {
        // Mostrar loading en el select
        selectCategoria.innerHTML = '<option value="">Cargando categorías...</option>';
        selectCategoria.disabled = true;
        
        // Realizar petición al servidor
        const response = await fetch('../controlador/getCategorias.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        // Convertir respuesta a JSON
        const data = await response.json();
        
        // Verificar si la operación fue exitosa
        if (data.success) {
            // Limpiar el select y agregar opción por defecto
            selectCategoria.innerHTML = '<option value="">Seleccione categoría...</option>';
            
            // Agregar cada categoría al select
            data.data.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nombre;
                selectCategoria.appendChild(option);
            });
            
            // Habilitar el select
            selectCategoria.disabled = false;
            
  
            
        } else {
            throw new Error(data.message || 'Error al cargar las categorías');
        }
        
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        
        // Mostrar mensaje de error en el select
        selectCategoria.innerHTML = '<option value="">Error al cargar categorías</option>';
        selectCategoria.disabled = true;
        
        // Mostrar notificación de error al usuario
        mostrarNotificacion('Error al cargar las categorías: ' + error.message, 'error');
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.getElementById('notification');
    
    if (notification) {
        notification.textContent = mensaje;
        notification.className = `notification ${tipo}`;
        notification.style.display = 'block';
        
        // Ocultar notificación después de 3 segundos
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Función para buscar categorías (opcional - para búsqueda en tiempo real)
function buscarCategoria(termino) {
    const selectCategoria = document.getElementById('categoria');
    const opciones = selectCategoria.querySelectorAll('option');
    
    opciones.forEach(opcion => {
        if (opcion.value === '') return; // No filtrar la opción por defecto
        
        const texto = opcion.textContent.toLowerCase();
        const busqueda = termino.toLowerCase();
        
        if (texto.includes(busqueda)) {
            opcion.style.display = 'block';
        } else {
            opcion.style.display = 'none';
        }
    });
}

// Cargar categorías cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    cargarCategorias();
});

// Event listener para recargar categorías si es necesario
document.getElementById('btnActualizar')?.addEventListener('click', function() {
    cargarCategorias();
});

// Función para obtener la categoría seleccionada
function obtenerCategoriaSeleccionada() {
    const selectCategoria = document.getElementById('categoria');
    return {
        id: selectCategoria.value,
        nombre: selectCategoria.options[selectCategoria.selectedIndex].textContent
    };
}

// Función para establecer una categoría específica
function establecerCategoria(idCategoria) {
    const selectCategoria = document.getElementById('categoria');
    selectCategoria.value = idCategoria;
}