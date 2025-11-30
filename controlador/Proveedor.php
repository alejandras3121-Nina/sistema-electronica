<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../modelo/Conexion.php';

class ProveedorController {
    private $conexion;

    public function __construct() {
        $this->conexion = new Conexion();
    }

    public function obtenerProveedores() {
        try {
            $sql = "SELECT 
                        idProveedor,
                        nombreEmpresa,
                        nombreContacto,
                        telefono,
                        direccion,
                        correo,
                        estado
                    FROM tb_proveedor 
                    ORDER BY idProveedor ASC";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute();
            $proveedores = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convertir estado a booleano en la respuesta
            foreach ($proveedores as &$proveedor) {
                $proveedor['estado'] = (bool)$proveedor['estado'];
            }

            echo json_encode(['success' => true, 'data' => $proveedores]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function crearProveedor($datos) {
        try {
            // Validar que todos los campos requeridos estén presentes
            $camposRequeridos = ['nombreEmpresa', 'nombreContacto', 'telefono', 'direccion', 'correo'];
            foreach ($camposRequeridos as $campo) {
                if (!isset($datos[$campo]) || trim($datos[$campo]) === '') {
                    echo json_encode([
                        'success' => false,
                        'message' => "El campo {$campo} es obligatorio"
                    ]);
                    return;
                }
            }

            // Validar formato de correo electrónico
            if (!filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'El formato del correo electrónico no es válido'
                ]);
                return;
            }

            // Verificar si ya existe un proveedor con el mismo correo
            $sqlCheck = "SELECT COUNT(*) as total FROM tb_proveedor WHERE correo = :correo";
            $stmtCheck = $this->conexion->pdo->prepare($sqlCheck);
            $stmtCheck->execute([':correo' => $datos['correo']]);
            $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($result['total'] > 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Ya existe un proveedor con este correo electrónico'
                ]);
                return;
            }

            // Verificar si ya existe un proveedor con el mismo nombre de empresa
            $sqlCheckEmpresa = "SELECT COUNT(*) as total FROM tb_proveedor WHERE nombreEmpresa = :nombreEmpresa";
            $stmtCheckEmpresa = $this->conexion->pdo->prepare($sqlCheckEmpresa);
            $stmtCheckEmpresa->execute([':nombreEmpresa' => $datos['nombreEmpresa']]);
            $resultEmpresa = $stmtCheckEmpresa->fetch(PDO::FETCH_ASSOC);

            if ($resultEmpresa['total'] > 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Ya existe un proveedor con este nombre de empresa'
                ]);
                return;
            }

            $sql = "INSERT INTO tb_proveedor (nombreEmpresa, nombreContacto, telefono, direccion, correo, estado)
                    VALUES (:nombreEmpresa, :nombreContacto, :telefono, :direccion, :correo, :estado)";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([
                ':nombreEmpresa' => trim($datos['nombreEmpresa']),
                ':nombreContacto' => trim($datos['nombreContacto']),
                ':telefono' => trim($datos['telefono']),
                ':direccion' => trim($datos['direccion']),
                ':correo' => trim($datos['correo']),
                ':estado' => filter_var($datos['estado'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0
            ]);

            echo json_encode(['success' => true, 'message' => 'Proveedor creado exitosamente']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error en base de datos: ' . $e->getMessage()]);
        }
    }

    public function actualizarProveedor($id, $datos) {
        try {
            // Validar que todos los campos requeridos estén presentes
            $camposRequeridos = ['nombreEmpresa', 'nombreContacto', 'telefono', 'direccion', 'correo'];
            foreach ($camposRequeridos as $campo) {
                if (!isset($datos[$campo]) || trim($datos[$campo]) === '') {
                    echo json_encode([
                        'success' => false,
                        'message' => "El campo {$campo} es obligatorio"
                    ]);
                    return;
                }
            }

            // Validar formato de correo electrónico
            if (!filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'El formato del correo electrónico no es válido'
                ]);
                return;
            }

            // Verificar si ya existe otro proveedor con el mismo correo
            $sqlCheck = "SELECT COUNT(*) as total FROM tb_proveedor WHERE correo = :correo AND idProveedor != :id";
            $stmtCheck = $this->conexion->pdo->prepare($sqlCheck);
            $stmtCheck->execute([':correo' => $datos['correo'], ':id' => $id]);
            $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($result['total'] > 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Ya existe otro proveedor con este correo electrónico'
                ]);
                return;
            }

            // Verificar si ya existe otro proveedor con el mismo nombre de empresa
            $sqlCheckEmpresa = "SELECT COUNT(*) as total FROM tb_proveedor WHERE nombreEmpresa = :nombreEmpresa AND idProveedor != :id";
            $stmtCheckEmpresa = $this->conexion->pdo->prepare($sqlCheckEmpresa);
            $stmtCheckEmpresa->execute([':nombreEmpresa' => $datos['nombreEmpresa'], ':id' => $id]);
            $resultEmpresa = $stmtCheckEmpresa->fetch(PDO::FETCH_ASSOC);

            if ($resultEmpresa['total'] > 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Ya existe otro proveedor con este nombre de empresa'
                ]);
                return;
            }

            $sql = "UPDATE tb_proveedor SET 
                        nombreEmpresa = :nombreEmpresa, 
                        nombreContacto = :nombreContacto, 
                        telefono = :telefono, 
                        direccion = :direccion, 
                        correo = :correo,
                        estado = :estado 
                    WHERE idProveedor = :id";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':nombreEmpresa' => trim($datos['nombreEmpresa']),
                ':nombreContacto' => trim($datos['nombreContacto']),
                ':telefono' => trim($datos['telefono']),
                ':direccion' => trim($datos['direccion']),
                ':correo' => trim($datos['correo']),
                ':estado' => filter_var($datos['estado'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0
            ]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Proveedor actualizado exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el proveedor o no se realizaron cambios']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error en base de datos: ' . $e->getMessage()]);
        }
    }

    public function eliminarProveedor($id) {
        try {
            // Verificar si el proveedor tiene productos asociados
            $sqlCheckProductos = "SELECT COUNT(*) as total FROM tb_producto WHERE idProveedor = :id";
            $stmtCheckProductos = $this->conexion->pdo->prepare($sqlCheckProductos);
            $stmtCheckProductos->execute([':id' => $id]);
            $resultProductos = $stmtCheckProductos->fetch(PDO::FETCH_ASSOC);

            if ($resultProductos['total'] > 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No se puede eliminar el proveedor porque tiene productos asociados. Primero elimine o reasigne los productos.'
                ]);
                return;
            }

            $sql = "DELETE FROM tb_proveedor WHERE idProveedor = :id";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Proveedor eliminado permanentemente de la base de datos']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el proveedor a eliminar']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error en base de datos: ' . $e->getMessage()]);
        }
    }
}

// Instanciar controlador y manejar peticiones
$controller = new ProveedorController();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $controller->obtenerProveedores();
        break;
    case 'POST':
        if ($input) {
            $controller->crearProveedor($input);
        } else {
            echo json_encode(['success' => false, 'message' => 'Datos requeridos']);
        }
        break;
    case 'PUT':
        if (isset($_GET['id']) && $input) {
            $controller->actualizarProveedor($_GET['id'], $input);
        } else {
            echo json_encode(['success' => false, 'message' => 'ID y datos requeridos']);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            $controller->eliminarProveedor($_GET['id']);
        } else {
            echo json_encode(['success' => false, 'message' => 'ID requerido']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}
?>