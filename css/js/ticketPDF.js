document.addEventListener("DOMContentLoaded", () => {
  const btnRegistrar = document.querySelector(".registrar");

  if (btnRegistrar) {
    btnRegistrar.addEventListener("click", generarTicketPDF);
  }
});

function generarTicketPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Obtener nombre del cliente
  const select = document.getElementById("selectCliente");
  const nombreCliente = select.options[select.selectedIndex]?.text || "Cliente no seleccionado";

  // Obtener productos de la tabla
  const filas = document.querySelectorAll("table tbody tr");
  if (filas.length === 0) {
    alert("No hay productos en la factura.");
    return;
  }

  const productos = [];
  filas.forEach((fila) => {
    const celdas = fila.querySelectorAll("td");
    productos.push({
      cantidad: celdas[2].innerText,
      nombre: celdas[1].innerText,
      precio: celdas[3].innerText,
      total: celdas[7].innerText,
    });
  });

  // Obtener total a pagar
  const totalPagar = document.querySelectorAll("input[readonly]")[1].value || "0.0";

  // Iniciar PDF
  let y = 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text("Balam Sys", 105, y, { align: "center" });

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Cliente: ${nombreCliente}`, 10, y);
  y += 6;
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 10, y);
  y += 8;

  // Cabecera de tabla
  doc.setFont("helvetica", "bold");
  doc.setFillColor(230, 230, 230); // Gris claro
  doc.rect(10, y, 190, 8, 'F');
  doc.text("Cant.", 14, y + 6);
  doc.text("Producto", 40, y + 6);
  doc.text("P.Unit", 120, y + 6);
  doc.text("Total", 160, y + 6);
  y += 12; // <-- Aquí agregamos espacio extra entre cabecera y filas

  // Detalle de productos
  doc.setFont("helvetica", "normal");
  productos.forEach(p => {
    doc.text(p.cantidad, 14, y);
    doc.text(p.nombre, 40, y);
    doc.text(p.precio, 120, y);
    doc.text(p.total, 160, y);
    y += 7;
  });

  // Total final
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Total a pagar: $${totalPagar}`, 140, y);

  // Firma
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Firma del Cliente ____________________________", 10, y);

  // Mensaje final
  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("¡Gracias por su compra!", 105, y, { align: "center" });

  // Descargar PDF
  doc.save(`ticket_${nombreCliente.replace(/\s/g, "_")}.pdf`);

  // Limpiar formulario
  limpiarFormulario();
}

function limpiarFormulario() {
  document.getElementById("selectCliente").value = "";
  document.getElementById("selectProducto").value = "";
  document.getElementById("buscarCliente").value = "";
  document.getElementById("buscarProducto").value = "";
  document.getElementById("cantidadProducto").value = "";

  document.querySelector("table tbody").innerHTML = "";

  document.querySelectorAll("input[readonly]").forEach(input => input.value = "0.0");

  const efectivo = document.querySelector("input[type='number']");
  if (efectivo) efectivo.value = "";
}


