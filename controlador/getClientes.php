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
    
    // Consulta SQL para obtener los clientes activos
    $sql = "SELECT 
                idCliente AS id, 
                CONCAT(nombre, ' ', apellido) AS nombre_completo,
                nombre,
                apellido,
                cedula, 
                telefono, 
                direccion
            FROM tb_cliente 
            WHERE estado = 1 
            ORDER BY nombre, apellido";
    
    // Preparar y ejecutar la consulta
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    // Obtener todos los resultados
    $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Respuesta exitosa
    $response = array(
        'success' => true,
        'data' => $clientes,
        'message' => 'Clientes obtenidos correctamente'
    );
    
    echo json_encode($response);
    
} catch(PDOException $e) {
    // Error en la base de datos
    $response = array(
        'success' => false,
        'data' => array(),
        'message' => 'Error al obtener los clientes: ' . $e->getMessage()
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