<?php
include_once '../modelo/Usuario.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['user'], $_POST['pass'])) {
    $user = trim($_POST['user']);
    $pass = trim($_POST['pass']);
    
    if (empty($user) || empty($pass)) {
        header('Location: ../index.php?error=campos_vacios');
        exit();
    }
    
    $usuario = new Usuario();
    $resultado = $usuario->Loguearse($user, $pass);
    
    if (!empty($resultado)) {
        foreach ($resultado as $objeto) {
            $_SESSION['idUsuario'] = $objeto->idUsuario;
            $_SESSION['nombreCompleto'] = trim($objeto->nombre . ' ' . $objeto->apellido);
            $_SESSION['usuario'] = $objeto->usuario;
            $_SESSION['telefono'] = $objeto->telefono;
            $_SESSION['tipo_usuario'] = $objeto->tipo_usuario; // Guardamos el tipo de usuario
            $_SESSION['fechaLogin'] = date('Y-m-d H:i:s');
        }

        // Redirigir según el tipo de usuario
        if ($_SESSION['tipo_usuario'] === 'Administrador') {
            header('Location: ../Vista/FormMenu.html');
        } else if ($_SESSION['tipo_usuario'] === 'Empleado') {
            header('Location: ../Vista/menu_empleado.html');
        } else {
            // Por si se agregan más roles en el futuro
            header('Location: ../Vista/FormMenu.html');
        }

        exit();
    } else {
        header('Location: ../index.php?error=credenciales_incorrectas');
        exit();
    }
} else {
    header('Location: ../index.php');
    exit();
}
