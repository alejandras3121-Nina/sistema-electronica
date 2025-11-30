<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../modelo/Conexion.php';

// Log para debugging
error_log("=== INICIO getProveedores.php ===");

class ProveedorController {
    private $conexion;

    public function __construct() {
        try {
            $this->conexion = new Conexion();
            error_log("Conexión a BD establecida correctamente");
        } catch (Exception $e) {
            error_log("Error al conectar BD: " . $e->getMessage());
        }
    }

    public function obtenerProveedores() {
        try {
            $sql = "SELECT idProveedor, nombreEmpresa, nombreContacto, telefono, correo, estado 
                    FROM tb_proveedor 
                    WHERE estado = 1 
                    ORDER BY nombreEmpresa ASC";
                    
            error_log("SQL Query: " . $sql);
            
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute();
            $proveedores = $stmt->fetchAll(PDO::FETCH_ASSOC);

            error_log("Proveedores encontrados: " . count($proveedores));
            error_log("Datos proveedores: " . json_encode($proveedores));

            // Verificar si hay proveedores
            if (empty($proveedores)) {
                error_log("ADVERTENCIA: No se encontraron proveedores activos");
                // Intentar obtener todos los proveedores sin filtro de estado
                $sqlTodos = "SELECT idProveedor, nombreEmpresa, nombreContacto, telefono, correo, estado 
                           FROM tb_proveedor 
                           ORDER BY nombreEmpresa ASC";
                $stmtTodos = $this->conexion->pdo->prepare($sqlTodos);
                $stmtTodos->execute();
                $todosProv = $stmtTodos->fetchAll(PDO::FETCH_ASSOC);
                error_log("Todos los proveedores (incluidos inactivos): " . json_encode($todosProv));
                
                // Si no hay proveedores activos pero sí hay proveedores en general, devolver mensaje específico
                if (!empty($todosProv)) {
                    echo json_encode([
                        'success' => false, 
                        'message' => 'No hay proveedores activos disponibles',
                        'data' => []
                    ]);
                    return;
                }
            }

            echo json_encode(['success' => true, 'data' => $proveedores]);
        } catch (PDOException $e) {
            error_log("Error PDO: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => $e->getMessage(), 'data' => []]);
        }
    }
}

$controller = new ProveedorController();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $controller->obtenerProveedores();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido', 'data' => []]);
        break;
}

error_log("=== FIN getProveedores.php ===");
?>