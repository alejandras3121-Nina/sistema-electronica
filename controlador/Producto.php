<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../modelo/Conexion.php';

// Log para debugging
error_log("=== INICIO Producto.php ===");

class ProductoController {
    private $conexion;

    public function __construct() {
        try {
            $this->conexion = new Conexion();
            error_log("Conexión a BD establecida correctamente en ProductoController");
        } catch (Exception $e) {
            error_log("Error al conectar BD en ProductoController: " . $e->getMessage());
        }
    }

    public function obtenerProductos() {
        try {
            $sql = "SELECT p.*, 
                           c.descripcion AS categoria,
                           pr.nombreEmpresa AS proveedor,
                           pr.idProveedor
                    FROM tb_producto p 
                    INNER JOIN tb_categoria c ON p.idCategoria = c.idCategoria 
                    INNER JOIN tb_proveedor pr ON p.idProveedor = pr.idProveedor
                    ORDER BY p.idProducto ASC";
            
            error_log("SQL Query productos: " . $sql);
            
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute();
            $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            error_log("Productos encontrados: " . count($productos));
            if (count($productos) > 0) {
                error_log("Primer producto: " . json_encode($productos[0]));
            }

            echo json_encode(['success' => true, 'data' => $productos]);
        } catch (PDOException $e) {
            error_log("Error PDO en obtenerProductos: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function obtenerProductoPorId($id) {
        try {
            $sql = "SELECT p.*, 
                           c.descripcion AS categoria,
                           pr.nombreEmpresa AS proveedor,
                           pr.idProveedor
                    FROM tb_producto p 
                    INNER JOIN tb_categoria c ON p.idCategoria = c.idCategoria 
                    INNER JOIN tb_proveedor pr ON p.idProveedor = pr.idProveedor
                    WHERE p.idProducto = :id";
            
            error_log("SQL Query producto por ID: " . $sql . " | ID: " . $id);
            
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([':id' => $id]);
            $producto = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($producto) {
                error_log("Producto encontrado: " . json_encode($producto));
                echo json_encode(['success' => true, 'data' => $producto]);
            } else {
                error_log("Producto no encontrado con ID: " . $id);
                echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
            }
        } catch (PDOException $e) {
            error_log("Error PDO en obtenerProductoPorId: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function crearProducto($datos) {
        try {
            error_log("Datos recibidos para crear producto: " . json_encode($datos));
            
            $sql = "INSERT INTO tb_producto (nombre, cantidad, precio, descripcion, porcentajeIva, idCategoria, idProveedor, estado)
                    VALUES (:nombre, :cantidad, :precio, :descripcion, :porcentajeIva, :idCategoria, :idProveedor, :estado)";
            
            error_log("SQL Insert: " . $sql);
            
            $stmt = $this->conexion->pdo->prepare($sql);
            $params = [
                ':nombre' => $datos['nombre'],
                ':cantidad' => $datos['cantidad'],
                ':precio' => $datos['precio'],
                ':descripcion' => $datos['descripcion'],
                ':porcentajeIva' => $datos['porcentajeIva'],
                ':idCategoria' => $datos['idCategoria'],
                ':idProveedor' => $datos['idProveedor'],
                ':estado' => $datos['estado']
            ];
            
            error_log("Parámetros: " . json_encode($params));
            
            $stmt->execute($params);

            error_log("Producto creado exitosamente");
            echo json_encode(['success' => true, 'message' => 'Producto creado exitosamente']);
        } catch (PDOException $e) {
            error_log("Error PDO en crearProducto: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function actualizarProducto($id, $datos) {
        try {
            error_log("Actualizando producto ID: " . $id . " con datos: " . json_encode($datos));
            
            $sql = "UPDATE tb_producto SET 
                        nombre = :nombre, 
                        cantidad = :cantidad, 
                        precio = :precio, 
                        descripcion = :descripcion, 
                        porcentajeIva = :porcentajeIva, 
                        idCategoria = :idCategoria,
                        idProveedor = :idProveedor,
                        estado = :estado 
                    WHERE idProducto = :id";
                    
            $stmt = $this->conexion->pdo->prepare($sql);
            $params = [
                ':id' => $id,
                ':nombre' => $datos['nombre'],
                ':cantidad' => $datos['cantidad'],
                ':precio' => $datos['precio'],
                ':descripcion' => $datos['descripcion'],
                ':porcentajeIva' => $datos['porcentajeIva'],
                ':idCategoria' => $datos['idCategoria'],
                ':idProveedor' => $datos['idProveedor'],
                ':estado' => $datos['estado']
            ];
            
            error_log("Parámetros actualización: " . json_encode($params));
            
            $stmt->execute($params);

            if ($stmt->rowCount() > 0) {
                error_log("Producto actualizado exitosamente");
                echo json_encode(['success' => true, 'message' => 'Producto actualizado exitosamente']);
            } else {
                error_log("No se encontró el producto o no se realizaron cambios");
                echo json_encode(['success' => false, 'message' => 'No se encontró el producto o no se realizaron cambios']);
            }
        } catch (PDOException $e) {
            error_log("Error PDO en actualizarProducto: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function eliminarProducto($id) {
        try {
            error_log("Eliminando producto ID: " . $id);
            
            $sql = "DELETE FROM tb_producto WHERE idProducto = :id";
            $stmt = $this->conexion->pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() > 0) {
                error_log("Producto eliminado exitosamente");
                echo json_encode(['success' => true, 'message' => 'Producto eliminado permanentemente']);
            } else {
                error_log("No se encontró el producto a eliminar");
                echo json_encode(['success' => false, 'message' => 'No se encontró el producto a eliminar']);
            }
        } catch (PDOException $e) {
            error_log("Error PDO en eliminarProducto: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

$controller = new ProductoController();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

error_log("Método HTTP: " . $method);
if ($input) {
    error_log("Input recibido: " . json_encode($input));
}

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            error_log("Obteniendo producto por ID: " . $_GET['id']);
            $controller->obtenerProductoPorId($_GET['id']);
        } else {
            error_log("Obteniendo todos los productos");
            $controller->obtenerProductos();
        }
        break;
    case 'POST':
        if ($input) {
            error_log("Creando nuevo producto");
            $controller->crearProducto($input);
        } else {
            error_log("Error: No se recibieron datos para crear producto");
            echo json_encode(['success' => false, 'message' => 'Datos requeridos']);
        }
        break;
    case 'PUT':
        if (isset($_GET['id']) && $input) {
            error_log("Actualizando producto ID: " . $_GET['id']);
            $controller->actualizarProducto($_GET['id'], $input);
        } else {
            error_log("Error: ID y datos requeridos para actualizar");
            echo json_encode(['success' => false, 'message' => 'ID y datos requeridos']);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            error_log("Eliminando producto ID: " . $_GET['id']);
            $controller->eliminarProducto($_GET['id']);
        } else {
            error_log("Error: ID requerido para eliminar");
            echo json_encode(['success' => false, 'message' => 'ID requerido']);
        }
        break;
    default:
        error_log("Método no permitido: " . $method);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}

error_log("=== FIN Producto.php ===");
?>