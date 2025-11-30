<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'Conexion.php';

class ClienteController {
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }

    public function obtenerClientes() {
        try {
            // Obtener TODOS los clientes (activos e inactivos) para mostrar ambos estados
            $sql = "SELECT * FROM tb_cliente ORDER BY idCliente ASC";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute();
            $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $clientes]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function crearCliente($datos) {
        try {
            $sql = "INSERT INTO tb_cliente (nombre, apellido, cedula, telefono, direccion, estado)
                    VALUES (:nombre, :apellido, :cedula, :telefono, :direccion, :estado)";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([
                ':nombre' => $datos['nombre'],
                ':apellido' => $datos['apellido'],
                ':cedula' => $datos['cedula'],
                ':telefono' => $datos['telefono'],
                ':direccion' => $datos['direccion'],
                ':estado' => $datos['estado']
            ]);

            echo json_encode(['success' => true, 'message' => 'Cliente creado exitosamente']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function actualizarCliente($id, $datos) {
        try {
            $sql = "UPDATE tb_cliente SET nombre = :nombre, apellido = :apellido, cedula = :cedula, telefono = :telefono, direccion = :direccion, estado = :estado WHERE idCliente = :id";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':nombre' => $datos['nombre'],
                ':apellido' => $datos['apellido'],
                ':cedula' => $datos['cedula'],
                ':telefono' => $datos['telefono'],
                ':direccion' => $datos['direccion'],
                ':estado' => $datos['estado']
            ]);

            echo json_encode(['success' => true, 'message' => 'Cliente actualizado exitosamente']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function eliminarCliente($id) {
        try {
            // Verificar si el cliente tiene ventas asociadas
            $sqlCheck = "SELECT COUNT(*) as total FROM tb_cabecera_venta WHERE idCliente = :id";
            $stmtCheck = $this->conexion->pdo->prepare($sqlCheck);
            $stmtCheck->execute([':id' => $id]);
            $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($result['total'] > 0) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'No se puede eliminar el cliente porque tiene ventas asociadas. Puede cambiar su estado a Inactivo.'
                ]);
                return;
            }

            // Si no tiene ventas, proceder con la eliminación física
            $sql = "DELETE FROM tb_cliente WHERE idCliente = :id";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Cliente eliminado permanentemente de la base de datos']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el cliente a eliminar']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

$controller = new ClienteController();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $controller->obtenerClientes();
        break;
    case 'POST':
        $controller->crearCliente($input);
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            $controller->actualizarCliente($_GET['id'], $input);
        } else {
            echo json_encode(['success' => false, 'message' => 'ID requerido']);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            $controller->eliminarCliente($_GET['id']);
        } else {
            echo json_encode(['success' => false, 'message' => 'ID requerido']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}