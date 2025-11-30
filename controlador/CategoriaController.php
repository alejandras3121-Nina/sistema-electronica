<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../modelo/Conexion.php';

class CategoriaController {
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }

    public function obtenerCategorias() {
        try {
            // Obtener TODAS las categorías (activas e inactivas) para mostrar ambos estados
            $sql = "SELECT * FROM tb_categoria ORDER BY idCategoria ASC";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute();
            $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $categorias]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function crearCategoria($datos) {
        try {
            // Verificar si la descripción de categoría ya existe
            $sqlCheck = "SELECT COUNT(*) as total FROM tb_categoria WHERE descripcion = :descripcion";
            $stmtCheck = $this->conexion->pdo->prepare($sqlCheck);
            $stmtCheck->execute([':descripcion' => $datos['descripcion']]);
            $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($result['total'] > 0) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'La descripción de categoría ya existe. Elija otra descripción.'
                ]);
                return;
            }

            $sql = "INSERT INTO tb_categoria (descripcion, estado) VALUES (:descripcion, :estado)";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([
                ':descripcion' => $datos['descripcion'],
                ':estado' => $datos['estado']
            ]);

            echo json_encode(['success' => true, 'message' => 'Categoría creada exitosamente']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function actualizarCategoria($id, $datos) {
        try {
            // Verificar si la descripción ya existe (excluyendo la categoría actual)
            $sqlCheck = "SELECT COUNT(*) as total FROM tb_categoria WHERE descripcion = :descripcion AND idCategoria != :id";
            $stmtCheck = $this->conexion->pdo->prepare($sqlCheck);
            $stmtCheck->execute([':descripcion' => $datos['descripcion'], ':id' => $id]);
            $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($result['total'] > 0) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'La descripción de categoría ya existe. Elija otra descripción.'
                ]);
                return;
            }

            $sql = "UPDATE tb_categoria SET descripcion = :descripcion, estado = :estado WHERE idCategoria = :id";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':descripcion' => $datos['descripcion'],
                ':estado' => $datos['estado']
            ]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Categoría actualizada exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró la categoría o no se realizaron cambios']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function eliminarCategoria($id) {
        try {
            // Verificar si la categoría está siendo usada por productos
            $sqlCheck = "SELECT COUNT(*) as total FROM tb_producto WHERE idCategoria = :id";
            $stmtCheck = $this->conexion->pdo->prepare($sqlCheck);
            $stmtCheck->execute([':id' => $id]);
            $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($result['total'] > 0) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'No se puede eliminar la categoría porque tiene productos asociados. Elimine primero los productos.'
                ]);
                return;
            }

            // Eliminar físicamente la categoría de la base de datos
            $sql = "DELETE FROM tb_categoria WHERE idCategoria = :id";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Categoría eliminada permanentemente de la base de datos']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró la categoría a eliminar']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

$controller = new CategoriaController();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $controller->obtenerCategorias();
        break;
    case 'POST':
        if ($input) {
            $controller->crearCategoria($input);
        } else {
            echo json_encode(['success' => false, 'message' => 'Datos requeridos']);
        }
        break;
    case 'PUT':
        if (isset($_GET['id']) && $input) {
            $controller->actualizarCategoria($_GET['id'], $input);
        } else {
            echo json_encode(['success' => false, 'message' => 'ID y datos requeridos']);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            $controller->eliminarCategoria($_GET['id']);
        } else {
            echo json_encode(['success' => false, 'message' => 'ID requerido']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}
?>