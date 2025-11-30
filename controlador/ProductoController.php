<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../modelo/Conexion.php';

class ProductoController {
    private $conexion;

    public function __construct() {
        $this->conexion = new Conexion();
    }

    public function actualizarStock($idProducto, $cantidadVendida) {
        try {
            // Obtener la cantidad actual
            $sqlSelect = "SELECT cantidad FROM tb_producto WHERE idProducto = :idProducto";
            $stmtSelect = $this->conexion->pdo->prepare($sqlSelect);
            $stmtSelect->execute([':idProducto' => $idProducto]);
            $producto = $stmtSelect->fetch(PDO::FETCH_ASSOC);

            if (!$producto) {
                echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
                return;
            }

            $cantidadActual = $producto['cantidad'];
            $nuevaCantidad = $cantidadActual - $cantidadVendida;

            if ($nuevaCantidad < 0) {
                echo json_encode(['success' => false, 'message' => 'Stock insuficiente']);
                return;
            }

            // Actualizar cantidad
            $sqlUpdate = "UPDATE tb_producto SET cantidad = :nuevaCantidad WHERE idProducto = :idProducto";
            $stmtUpdate = $this->conexion->pdo->prepare($sqlUpdate);
            $stmtUpdate->execute([
                ':nuevaCantidad' => $nuevaCantidad,
                ':idProducto' => $idProducto
            ]);

            echo json_encode(['success' => true, 'message' => 'Stock actualizado correctamente']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

// Ruteo básico
$controller = new ProductoController();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'PUT') {
    if (isset($_GET['idProducto']) && isset($input['cantidadVendida'])) {
        $controller->actualizarStock($_GET['idProducto'], $input['cantidadVendida']);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de producto y cantidad vendida requeridos']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
