<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir la clase de conexión
include_once '../Modelo/Conexion.php';

try {
    // Crear instancia de la conexión
    $conexion = new Conexion();
    $pdo = $conexion->pdo;
    
    // Consulta SQL para obtener los productos activos con información de categoría
    $sql = "SELECT 
                p.idProducto AS id, 
                p.nombre, 
                p.cantidad, 
                p.precio, 
                p.descripcion, 
                p.porcentajeIva,
                c.descripcion AS categoria
            FROM tb_producto p 
            INNER JOIN tb_categoria c ON p.idCategoria = c.idCategoria
            WHERE p.estado = 1 AND p.cantidad > 0
            ORDER BY p.nombre";
    
    // Preparar y ejecutar la consulta
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    // Obtener todos los resultados
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Respuesta exitosa
    $response = array(
        'success' => true,
        'data' => $productos,
        'message' => 'Productos obtenidos correctamente'
    );
    
    echo json_encode($response);
    
} catch(PDOException $e) {
    // Error en la base de datos
    $response = array(
        'success' => false,
        'data' => array(),
        'message' => 'Error al obtener los productos: ' . $e->getMessage()
    );
    
    echo json_encode($response);
} catch(Exception $e) {
    // Error general
    $response = array(
        'success' => false,
        'data' => array(),
        'message' => 'Error general: ' . $e->getMessage()
    );
    
    echo json_encode($response);
}
?>