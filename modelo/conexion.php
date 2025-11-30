<?php
class Conexion {
    private $servidor   = "localhost";
    private $db         = "bd_sistema_ventas";
    private $puerto     = 3306;
    private $charset    = "utf8mb4";
    private $usuario    = "root";
    private $contrasena = "12345678";
    public  $pdo        = null;

    private $atributos = [
        PDO::ATTR_CASE              => PDO::CASE_LOWER,
        PDO::ATTR_ERRMODE           => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_ORACLE_NULLS      => PDO::NULL_EMPTY_STRING,
        PDO::ATTR_DEFAULT_FETCH_MODE=> PDO::FETCH_OBJ
    ];

    public function __construct() {
        try {
            $this->pdo = new PDO(
                "mysql:host={$this->servidor};"
                ."dbname={$this->db};"
                ."port={$this->puerto};"
                ."charset={$this->charset}",
                $this->usuario,
                $this->contrasena,
                $this->atributos
            );
        } catch (PDOException $e) {
            die("Error de conexión a BD: " . $e->getMessage());
        }
    }
}
?>