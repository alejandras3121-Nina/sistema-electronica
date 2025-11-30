<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../modelo/Conexion.php';

class UsuarioController {
    private $conexion;

    public function __construct() {
        $this->conexion = new Conexion();
    }

    public function obtenerUsuarios() {
        try {
            $sql = "SELECT 
                        u.idUsuario,
                        u.nombre,
                        u.apellido,
                        u.usuario,
                        u.password,
                        u.telefono,
                        u.idTipoUsuario,
                        u.estado,
                        t.descripcion as tipoUsuario 
                    FROM tb_usuario u 
                    INNER JOIN tb_tipo_usuario t ON u.idTipoUsuario = t.idTipoUsuario 
                    ORDER BY u.idUsuario ASC";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute();
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convertir estado a booleano en la respuesta
            foreach ($usuarios as &$usuario) {
                $usuario['estado'] = (bool)$usuario['estado'];
            }

            echo json_encode(['success' => true, 'data' => $usuarios]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function obtenerTiposUsuario() {
        try {
            $sql = "SELECT * FROM tb_tipo_usuario ORDER BY descripcion";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute();
            $tipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $tipos]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function crearUsuario($datos) {
        try {
            if (!isset($datos['idTipoUsuario']) || $datos['idTipoUsuario'] === '') {
                echo json_encode([
                    'success' => false,
                    'message' => 'Debe seleccionar un tipo de usuario válido'
                ]);
                return;
            }

            $sqlCheck = "SELECT COUNT(*) as total FROM tb_usuario WHERE usuario = :usuario";
            $stmtCheck = $this->conexion->pdo->prepare($sqlCheck);
            $stmtCheck->execute([':usuario' => $datos['usuario']]);
            $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($result['total'] > 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'El nombre de usuario ya existe. Elija otro nombre.'
                ]);
                return;
            }

            $sqlCheckTipo = "SELECT COUNT(*) as total FROM tb_tipo_usuario WHERE idTipoUsuario = :idTipoUsuario";
            $stmtCheckTipo = $this->conexion->pdo->prepare($sqlCheckTipo);
            $stmtCheckTipo->execute([':idTipoUsuario' => $datos['idTipoUsuario']]);
            $resultTipo = $stmtCheckTipo->fetch(PDO::FETCH_ASSOC);

            if ($resultTipo['total'] == 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'El tipo de usuario seleccionado no es válido'
                ]);
                return;
            }

            $sql = "INSERT INTO tb_usuario (nombre, apellido, usuario, password, telefono, idTipoUsuario, estado)
                    VALUES (:nombre, :apellido, :usuario, :password, :telefono, :idTipoUsuario, :estado)";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([
                ':nombre' => $datos['nombre'],
                ':apellido' => $datos['apellido'],
                ':usuario' => $datos['usuario'],
                ':password' => $datos['password'], // IMPORTANTE: Hashear en producción
                ':telefono' => $datos['telefono'],
                ':idTipoUsuario' => intval($datos['idTipoUsuario']),
                ':estado' => filter_var($datos['estado'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0
            ]);

            echo json_encode(['success' => true, 'message' => 'Usuario creado exitosamente']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error en base de datos: ' . $e->getMessage()]);
        }
    }

    public function actualizarUsuario($id, $datos) {
        try {
            if (!isset($datos['idTipoUsuario']) || $datos['idTipoUsuario'] === '') {
                echo json_encode([
                    'success' => false,
                    'message' => 'Debe seleccionar un tipo de usuario válido'
                ]);
                return;
            }

            $sqlCheck = "SELECT COUNT(*) as total FROM tb_usuario WHERE usuario = :usuario AND idUsuario != :id";
            $stmtCheck = $this->conexion->pdo->prepare($sqlCheck);
            $stmtCheck->execute([':usuario' => $datos['usuario'], ':id' => $id]);
            $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($result['total'] > 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'El nombre de usuario ya existe. Elija otro nombre.'
                ]);
                return;
            }

            $sqlCheckTipo = "SELECT COUNT(*) as total FROM tb_tipo_usuario WHERE idTipoUsuario = :idTipoUsuario";
            $stmtCheckTipo = $this->conexion->pdo->prepare($sqlCheckTipo);
            $stmtCheckTipo->execute([':idTipoUsuario' => $datos['idTipoUsuario']]);
            $resultTipo = $stmtCheckTipo->fetch(PDO::FETCH_ASSOC);

            if ($resultTipo['total'] == 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'El tipo de usuario seleccionado no es válido'
                ]);
                return;
            }

            $sql = "UPDATE tb_usuario SET 
                        nombre = :nombre, 
                        apellido = :apellido, 
                        usuario = :usuario, 
                        password = :password, 
                        telefono = :telefono, 
                        idTipoUsuario = :idTipoUsuario,
                        estado = :estado 
                    WHERE idUsuario = :id";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':nombre' => $datos['nombre'],
                ':apellido' => $datos['apellido'],
                ':usuario' => $datos['usuario'],
                ':password' => $datos['password'],
                ':telefono' => $datos['telefono'],
                ':idTipoUsuario' => intval($datos['idTipoUsuario']),
                ':estado' => filter_var($datos['estado'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0
            ]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Usuario actualizado exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el usuario o no se realizaron cambios']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error en base de datos: ' . $e->getMessage()]);
        }
    }

    public function eliminarUsuario($id) {
        try {
            $sql = "DELETE FROM tb_usuario WHERE idUsuario = :id";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Usuario eliminado permanentemente de la base de datos']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el usuario a eliminar']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error en base de datos: ' . $e->getMessage()]);
        }
    }
}

$controller = new UsuarioController();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if (isset($_GET['action']) && $_GET['action'] === 'tipos') {
    $controller->obtenerTiposUsuario();
    exit;
}

switch ($method) {
    case 'GET':
        $controller->obtenerUsuarios();
        break;
    case 'POST':
        if ($input) {
            $controller->crearUsuario($input);
        } else {
            echo json_encode(['success' => false, 'message' => 'Datos requeridos']);
        }
        break;
    case 'PUT':
        if (isset($_GET['id']) && $input) {
            $controller->actualizarUsuario($_GET['id'], $input);
        } else {
            echo json_encode(['success' => false, 'message' => 'ID y datos requeridos']);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            $controller->eliminarUsuario($_GET['id']);
        } else {
            echo json_encode(['success' => false, 'message' => 'ID requerido']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}
?>
