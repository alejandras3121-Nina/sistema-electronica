<?php
require_once '../modelo/Conexion.php';
require_once '../vendor/autoload.php'; // Para usar TCPDF

use TCPDF;

/**
 * Clase para generar facturas de venta en PDF
 */
class VentaPDF {
    
    private $nombreCliente;
    private $cedulaCliente;
    private $telefonoCliente;
    private $direccionCliente;
    private $fechaActual;
    private $nombreArchivoPDFVenta;
    
    /**
     * Método para obtener datos del cliente
     */
    public function datosCliente($idCliente) {
        $conexion = new Conexion();
        
        try {
            $consulta = $conexion->pdo->prepare("SELECT * FROM tb_cliente WHERE idCliente = ?");
            $consulta->execute([$idCliente]);
            
            if ($cliente = $consulta->fetch()) {
                $this->nombreCliente = $cliente->nombre . " " . $cliente->apellido;
                $this->cedulaCliente = $cliente->cedula;
                $this->telefonoCliente = $cliente->telefono;
                $this->direccionCliente = $cliente->direccion;
            }
            
        } catch (PDOException $e) {
            echo "Error al obtener datos del cliente: " . $e->getMessage();
        }
    }
    
    /**
     * Método para generar la factura de venta en PDF
     */
    public function generarFacturaPDF($productosVenta = [], $totalPagar = 0) {
        try {
            // Cargar la fecha actual
            $this->fechaActual = date('Y/m/d');
            $fechaArchivo = str_replace('/', '_', $this->fechaActual);
            
            $this->nombreArchivoPDFVenta = "Venta_" . $this->nombreCliente . "_" . $fechaArchivo . ".pdf";
            
            // Crear documento PDF
            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
            
            // Configurar documento
            $pdf->SetCreator('Sistema de Ventas');
            $pdf->SetAuthor('Fantasma Corporation');
            $pdf->SetTitle('Factura de Venta');
            
            // Remover encabezado y pie de página predeterminados
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            
            // Configurar márgenes
            $pdf->SetMargins(15, 15, 15);
            
            // Agregar página
            $pdf->AddPage();
            
            // ENCABEZADO DE LA EMPRESA
            $pdf->SetFont('helvetica', 'B', 16);

            
            $pdf->SetFont('helvetica', '', 10);
            $pdf->Cell(0, 5, 'RUC: 0987654321001', 0, 1, 'C');
            $pdf->Cell(0, 5, 'Teléfono: 0987654321', 0, 1, 'C');

            
            $pdf->Ln(10);
            
            // INFORMACIÓN DE LA FACTURA
            $pdf->SetFont('helvetica', 'B', 12);
            $pdf->Cell(100, 8, 'FACTURA DE VENTA', 0, 0, 'L');
            $pdf->Cell(0, 8, 'Factura: 001', 0, 1, 'R');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->Cell(100, 6, '', 0, 0, 'L');
            $pdf->Cell(0, 6, 'Fecha: ' . $this->fechaActual, 0, 1, 'R');
            
            $pdf->Ln(10);
            
            // DATOS DEL CLIENTE
            $pdf->SetFont('helvetica', 'B', 12);
            $pdf->Cell(0, 8, 'DATOS DEL CLIENTE', 0, 1, 'L');
            $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
            $pdf->Ln(5);
            
            $pdf->SetFont('helvetica', '', 10);
            $pdf->Cell(40, 6, 'Cédula/RUC:', 0, 0, 'L');
            $pdf->Cell(60, 6, $this->cedulaCliente, 0, 0, 'L');
            $pdf->Cell(30, 6, 'Teléfono:', 0, 0, 'L');
            $pdf->Cell(0, 6, $this->telefonoCliente, 0, 1, 'L');
            
            $pdf->Cell(40, 6, 'Nombre:', 0, 0, 'L');
            $pdf->Cell(60, 6, $this->nombreCliente, 0, 0, 'L');
            $pdf->Cell(30, 6, 'Dirección:', 0, 0, 'L');
            $pdf->Cell(0, 6, $this->direccionCliente, 0, 1, 'L');
            
            $pdf->Ln(10);
            
            // PRODUCTOS
            $pdf->SetFont('helvetica', 'B', 12);
            $pdf->Cell(0, 8, 'DETALLE DE PRODUCTOS', 0, 1, 'L');
            $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
            $pdf->Ln(5);
            
            // Encabezados de tabla
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetFillColor(220, 220, 220);
            $pdf->Cell(25, 8, 'Cantidad', 1, 0, 'C', true);
            $pdf->Cell(70, 8, 'Descripción', 1, 0, 'C', true);
            $pdf->Cell(35, 8, 'Precio Unitario', 1, 0, 'C', true);
            $pdf->Cell(35, 8, 'Precio Total', 1, 1, 'C', true);
            
            // Datos de productos
            $pdf->SetFont('helvetica', '', 9);
            foreach ($productosVenta as $producto) {
                $pdf->Cell(25, 6, $producto['cantidad'], 1, 0, 'C');
                $pdf->Cell(70, 6, $producto['nombre'], 1, 0, 'L');
                $pdf->Cell(35, 6, '$' . number_format($producto['precio'], 2), 1, 0, 'R');
                $pdf->Cell(35, 6, '$' . number_format($producto['total'], 2), 1, 1, 'R');
            }
            
            $pdf->Ln(10);
            
            // TOTAL A PAGAR
            $pdf->SetFont('helvetica', 'B', 14);
            $pdf->Cell(0, 10, 'Total a pagar: $' . number_format($totalPagar, 2), 0, 1, 'R');
            
            $pdf->Ln(20);
            
            // FIRMA
            $pdf->SetFont('helvetica', '', 10);
            $pdf->Cell(0, 6, 'Cancelación y firma', 0, 1, 'C');
            $pdf->Ln(10);
            $pdf->Cell(0, 6, '_______________________', 0, 1, 'C');
            
            $pdf->Ln(10);
            
            // MENSAJE DE AGRADECIMIENTO
            $pdf->SetFont('helvetica', 'B', 12);
            $pdf->Cell(0, 10, '¡Gracias por su compra!', 0, 1, 'C');
            
            // Crear directorio si no existe
            $directorioFacturas = $_SERVER['DOCUMENT_ROOT'] . '/facturas/';
            if (!is_dir($directorioFacturas)) {
                mkdir($directorioFacturas, 0777, true);
            }
            
            // Guardar archivo
            $rutaCompleta = $directorioFacturas . $this->nombreArchivoPDFVenta;
            $pdf->Output($rutaCompleta, 'F');
            
            return $this->nombreArchivoPDFVenta;
            
        } catch (Exception $e) {
            echo "Error al generar factura: " . $e->getMessage();
            return false;
        }
    }
    
    /**
     * Método para descargar la factura generada
     */
    public function descargarFactura($nombreArchivo) {
        $rutaArchivo = $_SERVER['DOCUMENT_ROOT'] . '/facturas/' . $nombreArchivo;
        
        if (file_exists($rutaArchivo)) {
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $nombreArchivo . '"');
            header('Content-Length: ' . filesize($rutaArchivo));
            readfile($rutaArchivo);
        } else {
            echo "El archivo no existe.";
        }
    }
}
?>