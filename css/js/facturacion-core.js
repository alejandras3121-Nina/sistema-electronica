let carrito = [];

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.anadir').addEventListener('click', agregarProducto);
  document.querySelector('.calcular').addEventListener('click', calcularCambio);
  document.querySelector('.registrar').addEventListener('click', registrarVenta);

  document.getElementById('Descuento').addEventListener('change', () => {
    actualizarTabla();
    calcularResumen();
  });

  document.getElementById('iva').addEventListener('change', () => {
    actualizarTabla();
    calcularResumen();
  });
});

function agregarProducto() {
  const select = document.getElementById('selectProducto');
  const cantidad = parseInt(document.getElementById('cantidadProducto').value);
  const productoId = select.value;
  const option = select.selectedOptions[0];

  if (!productoId || isNaN(cantidad) || cantidad <= 0) {
    return mostrarNotificacion("Seleccione un producto válido y una cantidad mayor que 0", 'warning');
  }

  const nombre = option.getAttribute('data-nombre');
  const precio = parseFloat(option.getAttribute('data-precio'));
  const stock = parseInt(option.getAttribute('data-stock'));
  const iva = parseFloat(option.getAttribute('data-iva'));

  const existente = carrito.find(p => p.id === productoId);
  const totalSolicitado = (existente?.cantidad || 0) + cantidad;

  if (totalSolicitado > stock) {
    return mostrarNotificacion(`Stock insuficiente. Disponible: ${stock}`, 'error');
  }

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ id: productoId, nombre, cantidad, precio, iva });
  }

  actualizarTabla();
  calcularResumen();
}

function actualizarTabla() {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = '';

  const descuentoSel = parseFloat(document.getElementById('Descuento').value || 0);
  const ivaSel = parseFloat(document.getElementById('iva').value || 0);

  carrito.forEach((p, i) => {
    const subtotal = p.cantidad * p.precio;
    const descuento = subtotal * (descuentoSel / 100);
    const subtotalConDescuento = subtotal - descuento;
    const ivaCalc = subtotalConDescuento * (ivaSel / 100);
    const total = subtotalConDescuento + ivaCalc;

    const fila = `
      <tr>
        <td>${i + 1}</td>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>$${p.precio.toFixed(2)}</td>
        <td>$${subtotal.toFixed(2)}</td>
        <td>$${descuento.toFixed(2)}</td>
        <td>$${ivaCalc.toFixed(2)}</td>
        <td>$${total.toFixed(2)}</td>
        <td><button onclick="eliminarProducto(${i})">🗑️</button></td>
      </tr>`;
    tbody.insertAdjacentHTML('beforeend', fila);
  });
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  actualizarTabla();
  calcularResumen();
}

function calcularResumen() {
  const descuentoSel = parseFloat(document.getElementById('Descuento').value || 0);
  const ivaSel = parseFloat(document.getElementById('iva').value || 0);
  let subtotal = 0;

  carrito.forEach(p => {
    subtotal += p.cantidad * p.precio;
  });

  const descuento = subtotal * (descuentoSel / 100);
  const subtotalDescontado = subtotal - descuento;
  const ivaCalculado = subtotalDescontado * (ivaSel / 100);
  const total = subtotalDescontado + ivaCalculado;

  document.querySelectorAll('input[readonly]')[0].value = subtotal.toFixed(2); // Subtotal
  document.querySelectorAll('input[readonly]')[1].value = total.toFixed(2);    // Total a pagar

  return { total, subtotal };
}

function calcularCambio() {
  const efectivoInput = document.querySelector('input[type="number"][step="0.01"]');
  const efectivo = parseFloat(efectivoInput.value || 0);
  const total = parseFloat(document.querySelectorAll('input[readonly]')[1].value);

  if (efectivo < total) {
    return mostrarNotificacion("El efectivo no cubre el total", 'warning');
  }

  const cambio = efectivo - total;
  document.querySelectorAll('input[readonly]')[2].value = cambio.toFixed(2);
}

async function registrarVenta() {
  const clienteId = document.getElementById('selectCliente').value;
  const efectivo = parseFloat(document.querySelector('input[type="number"][step="0.01"]').value || 0);
  const { total } = calcularResumen();

  if (!clienteId) {
    return mostrarNotificacion("Debe seleccionar un cliente", 'warning');
  }

  if (carrito.length === 0) {
    return mostrarNotificacion("Debe añadir al menos un producto", 'warning');
  }

  if (efectivo < total) {
    return mostrarNotificacion("Efectivo insuficiente", 'error');
  }

  try {
    for (const p of carrito) {
      await fetch(`../controlador/ProductoController.php?idProducto=${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidadVendida: p.cantidad })
      });
    }

    mostrarNotificacion("Venta registrada y stock actualizado", 'success');
    resetFormulario();

  } catch (error) {
    console.error(error);
    mostrarNotificacion("Error al registrar la venta", 'error');
  }
}

function resetFormulario() {
  carrito = [];
  actualizarTabla();
  calcularResumen();
  document.getElementById('cantidadProducto').value = '';
  document.querySelector('input[type="number"][step="0.01"]').value = '';
  document.querySelectorAll('input[readonly]')[2].value = '0.0'; // Cambio
}
