<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../modelo/Conexion.php';

class ReporteClienteController {
    private $conexion;

    public function __construct() {
        $this->conexion = new Conexion();
    }

    // Obtener todos los clientes con o sin compras
    public function detalleTodosClientes() {
        try {
            $sql = "
                SELECT 
                    c.idCliente,
                    CONCAT(c.nombre, ' ', c.apellido) AS cliente,
                    v.idCabeceraVenta,
                    v.fechaVenta,
                    d.producto,
                    d.cantidad,
                    d.precioUnitario,
                    d.totalPagar
                FROM tb_cliente c
                LEFT JOIN tb_venta v ON c.idCliente = v.idCliente
                LEFT JOIN tb_detalle_venta d ON v.idCabeceraVenta = d.idCabeceraVenta
                ORDER BY c.idCliente, v.fechaVenta
            ";

            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute();
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $resultados]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

$controller = new ReporteClienteController();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $accion = $_GET['accion'] ?? '';

    switch ($accion) {
        case 'detalle_todos':
            $controller->detalleTodosClientes();
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
            break;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
