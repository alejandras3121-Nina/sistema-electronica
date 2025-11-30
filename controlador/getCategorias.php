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
    
    // Consulta SQL para obtener las categorías activas
    $sql = "SELECT idCategoria AS id, descripcion AS nombre FROM tb_categoria WHERE estado = 1 ORDER BY descripcion ";
    
    // Preparar y ejecutar la consulta
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    // Obtener todos los resultados
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Respuesta exitosa
    $response = array(
        'success' => true,
        'data' => $categorias,
        'message' => 'Categorías obtenidas correctamente'
    );
    
    echo json_encode($response);
    
} catch(PDOException $e) {
    // Error en la base de datos
    $response = array(
        'success' => false,
        'data' => array(),
        'message' => 'Error al obtener las categorías: ' . $e->getMessage()
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

// No es necesario cerrar la conexión manualmente con tu clase
?>