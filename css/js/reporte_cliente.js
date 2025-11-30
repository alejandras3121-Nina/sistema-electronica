document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generarReporteClientes");
  if (btn) btn.addEventListener("click", generarReportePDF);
});

async function generarReportePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  try {
    const response = await fetch("../controlador/ReporteClienteController.php?accion=detalle_todos");
    const json = await response.json();
    const datos = json.data || [];

    if (datos.length === 0) {
      alert("No hay datos para generar el reporte.");
      return;
    }

    let y = 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Reporte General de Clientes y Ventas", 105, y, { align: "center" });

    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Generado: ${new Date().toLocaleString()}`, 10, y);
    y += 10;

    let clienteAnterior = null;

    datos.forEach((row, index) => {
      // Agrupar por cliente
      if (row.cliente !== clienteAnterior) {
        y += 8;
        if (y >= 270) {
          doc.addPage();
          y = 10;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Cliente: ${row.cliente || "Sin nombre"} (ID: ${row.idCliente})`, 10, y);
        y += 6;
        doc.setFontSize(11);
        clienteAnterior = row.cliente;

        // Cabecera
        doc.setFillColor(240, 240, 240);
        doc.rect(10, y, 190, 7, 'F');
        doc.text("Fecha", 12, y + 5);
        doc.text("Producto", 50, y + 5);
        doc.text("Cant.", 120, y + 5);
        doc.text("P.Unit", 140, y + 5);
        doc.text("Total", 170, y + 5);
        y += 9;
      }

      if (y >= 270) {
        doc.addPage();
        y = 10;
      }

      // Si el cliente no tiene compras, solo muestra mensaje
      if (!row.idCabeceraVenta) {
        doc.setFont("helvetica", "italic");
        doc.text("Sin compras registradas", 12, y);
        y += 7;
        return;
      }

      doc.setFont("helvetica", "normal");
      doc.text(row.fechaVenta || "-", 12, y);
      doc.text(row.producto || "-", 50, y);
      doc.text(row.cantidad || "0", 120, y);
      doc.text(row.precioUnitario || "0.00", 140, y);
      doc.text(row.totalPagar || "0.00", 170, y);
      y += 6;
    });

    doc.save("reporte_clientes_compras.pdf");
  } catch (error) {
    console.error("Error generando el PDF:", error);
    alert("Ocurrió un error al generar el reporte.");
  }
}
