// Función para generar reporte de productos en PDF
async function generarReporteProductos() {
    try {
        // Obtener datos de productos
        const response = await fetch('../controlador/ProductoController.php');
        const data = await response.json();
        
        if (!data.success) {
            alert('Error al obtener datos de productos: ' + data.message);
            return;
        }
        
        const productos = data.data;
        
        if (productos.length === 0) {
            alert('No hay productos registrados.');
            return;
        }
        
        // Crear PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración inicial
        let y = 20;
        const margenIzquierdo = 10;
        const anchoLinea = 190;
        
        // Título del reporte
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text("REPORTE DE PRODUCTOS", 105, y, { align: "center" });
        
        y += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 105, y, { align: "center" });
        doc.text(`Total de productos: ${productos.length}`, 105, y + 6, { align: "center" });
        
        y += 20;
        
        // Línea separadora
        doc.setDrawColor(100, 100, 100);
        doc.line(margenIzquierdo, y, margenIzquierdo + anchoLinea, y);
        y += 8;
        
        // Encabezados de tabla
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setFillColor(230, 230, 230);
        doc.rect(margenIzquierdo, y, anchoLinea, 8, 'F');
        
        doc.text("ID", margenIzquierdo + 2, y + 6);
        doc.text("Producto", margenIzquierdo + 15, y + 6);
        doc.text("Categoría", margenIzquierdo + 60, y + 6);
        doc.text("Cant.", margenIzquierdo + 90, y + 6);
        doc.text("Precio", margenIzquierdo + 110, y + 6);
        doc.text("IVA%", margenIzquierdo + 135, y + 6);
        doc.text("Estado", margenIzquierdo + 155, y + 6);
        doc.text("Valor Total", margenIzquierdo + 175, y + 6);
        
        y += 12;
        
        // Datos de productos
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        
        let valorTotalInventario = 0;
        let productosActivos = 0;
        let productosInactivos = 0;
        
        productos.forEach((producto, index) => {
            // Verificar si necesitamos nueva página
            if (y > 270) {
                doc.addPage();
                y = 20;
                
                // Repetir encabezados en nueva página
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setFillColor(230, 230, 230);
                doc.rect(margenIzquierdo, y, anchoLinea, 8, 'F');
                
                doc.text("ID", margenIzquierdo + 2, y + 6);
                doc.text("Producto", margenIzquierdo + 15, y + 6);
                doc.text("Categoría", margenIzquierdo + 60, y + 6);
                doc.text("Cant.", margenIzquierdo + 90, y + 6);
                doc.text("Precio", margenIzquierdo + 110, y + 6);
                doc.text("IVA%", margenIzquierdo + 135, y + 6);
                doc.text("Estado", margenIzquierdo + 155, y + 6);
                doc.text("Valor Total", margenIzquierdo + 175, y + 6);
                
                y += 12;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
            }
            
            const estado = producto.estado == 1 ? 'Activo' : 'Inactivo';
            const valorTotal = parseFloat(producto.cantidad) * parseFloat(producto.precio);
            
            // Contadores para estadísticas
            if (producto.estado == 1) {
                productosActivos++;
                valorTotalInventario += valorTotal;
            } else {
                productosInactivos++;
            }
            
            // Alternar color de fondo
            if (index % 2 === 0) {
                doc.setFillColor(248, 248, 248);
                doc.rect(margenIzquierdo, y - 3, anchoLinea, 8, 'F');
            }
            
            doc.text(producto.idProducto.toString(), margenIzquierdo + 2, y + 2);
            doc.text(producto.nombre.substring(0, 20), margenIzquierdo + 15, y + 2);
            doc.text((producto.categoria || 'N/A').substring(0, 12), margenIzquierdo + 60, y + 2);
            doc.text(producto.cantidad.toString(), margenIzquierdo + 90, y + 2);
            doc.text(`$${parseFloat(producto.precio).toFixed(2)}`, margenIzquierdo + 110, y + 2);
            doc.text(`${producto.porcentajeIva}%`, margenIzquierdo + 135, y + 2);
            
            // Color del estado
            if (producto.estado == 1) {
                doc.setTextColor(0, 128, 0); // Verde para activo
            } else {
                doc.setTextColor(255, 0, 0); // Rojo para inactivo
            }
            doc.text(estado, margenIzquierdo + 155, y + 2);
            doc.setTextColor(0, 0, 0); // Volver a negro
            
            doc.text(`$${valorTotal.toFixed(2)}`, margenIzquierdo + 175, y + 2);
            
            y += 8;
        });
        
        // Estadísticas al final
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("RESUMEN ESTADÍSTICO", margenIzquierdo, y);
        y += 8;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`• Productos activos: ${productosActivos}`, margenIzquierdo, y);
        y += 6;
        doc.text(`• Productos inactivos: ${productosInactivos}`, margenIzquierdo, y);
        y += 6;
        doc.text(`• Total de productos: ${productos.length}`, margenIzquierdo, y);
        y += 6;
        doc.text(`• Valor total del inventario: $${valorTotalInventario.toFixed(2)}`, margenIzquierdo, y);
        
        // Análisis de stock bajo (menos de 10 unidades)
        const stockBajo = productos.filter(p => p.estado == 1 && parseInt(p.cantidad) < 10);
        if (stockBajo.length > 0) {
            y += 10;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 0, 0);
            doc.text("⚠ PRODUCTOS CON STOCK BAJO (menos de 10 unidades):", margenIzquierdo, y);
            y += 8;
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            stockBajo.forEach(producto => {
                doc.text(`• ${producto.nombre}: ${producto.cantidad} unidades`, margenIzquierdo + 5, y);
                y += 5;
            });
            doc.setTextColor(0, 0, 0); // Volver a negro
        }
        
        // Pie de página
        const totalPaginas = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPaginas; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Página ${i} de ${totalPaginas}`, 105, 285, { align: "center" });
            doc.text("Sistema de Gestión - Ballam Tec", 105, 290, { align: "center" });
        }
        
        // Descargar PDF
        const fechaArchivo = new Date().toISOString().split('T')[0];
        doc.save(`Reporte_Productos_${fechaArchivo}.pdf`);
        
    } catch (error) {
        console.error('Error al generar reporte:', error);
        alert('Error al generar el reporte de productos');
    }
}