<?php
include_once 'Conexion.php';

class Usuario {
    public $objetos;
    private $acceso;
    
    public function __construct() {
        $db = new Conexion();
        $this->acceso = $db->pdo;
    }

    // Función para iniciar sesión
    public function Loguearse($usuario, $password) {
        $sql = "SELECT 
                    u.idUsuario,
                    u.nombre,
                    u.apellido,
                    u.usuario,
                    u.telefono,
                    u.estado,
                    t.descripcion AS tipo_usuario
                FROM tb_usuario u
                JOIN tb_tipo_usuario t ON u.idTipoUsuario = t.idTipoUsuario
                WHERE u.usuario = :usuario 
                  AND u.password = :password 
                  AND u.estado = 1";
        
        try {
            $query = $this->acceso->prepare($sql);
            $query->execute([
                ':usuario' => $usuario, 
                ':password' => $password
            ]);
            $this->objetos = $query->fetchAll(PDO::FETCH_OBJ);
            return $this->objetos;
        } catch (PDOException $e) {
            die("Error en consulta de Usuario: " . $e->getMessage());
        }
    }

    // Crear un nuevo usuario (ahora requiere idTipoUsuario)
    public function CrearUsuario($nombre, $apellido, $usuario, $password, $telefono, $idTipoUsuario) {
        $sql = "INSERT INTO tb_usuario (nombre, apellido, usuario, password, telefono, idTipoUsuario, estado) 
                VALUES (:nombre, :apellido, :usuario, :password, :telefono, :idTipoUsuario, 1)";
        
        try {
            $query = $this->acceso->prepare($sql);
            return $query->execute([
                ':nombre' => $nombre,
                ':apellido' => $apellido,
                ':usuario' => $usuario,
                ':password' => $password,
                ':telefono' => $telefono,
                ':idTipoUsuario' => $idTipoUsuario
            ]);
        } catch (PDOException $e) {
            return false;
        }
    }

    // Obtener lista de usuarios activos con su tipo de usuario
    public function ObtenerUsuarios() {
        $sql = "SELECT 
                    u.*, 
                    t.descripcion AS tipo_usuario 
                FROM tb_usuario u
                JOIN tb_tipo_usuario t ON u.idTipoUsuario = t.idTipoUsuario
                WHERE u.estado = 1 
                ORDER BY u.nombre, u.apellido";
        
        try {
            $query = $this->acceso->prepare($sql);
            $query->execute();
            return $query->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            return [];
        }
    }
}
