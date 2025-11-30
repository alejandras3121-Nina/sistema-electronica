<?php
session_start();
if (!empty($_SESSION['idUsuario'])) {
    header('Location: Vista/FormMenu.html');
    exit();
} else {
    session_destroy();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Ventas - Login</title>

    <link rel="stylesheet" type="text/css" href="css/login.css">
    <!-- Íconos Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="contenedor">
        <div class="img">
            <img src="img/logoSYS.png" alt="Background">
        </div>
        <div class="contenido-login">
            <form action="controlador/LoginController.php" method="post">
                <h2>Sistema de Ventas</h2>
                
                <!-- Campo usuario -->
                <div class="input-div dni">
                    <div class="i">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="div">
                        <input type="text" name="user" placeholder="Usuario" class="input" required>
                    </div>
                </div>

                <!-- Campo contraseña con ícono de mostrar -->
                <div class="input-div pass">
                    <div class="i">
                        <i class="fas fa-lock"></i>
                    </div>
                    <div class="div" style="position: relative;">
                        <input type="password" name="pass" id="password" placeholder="Contraseña" class="input" required>
                        <span id="togglePassword" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;">
                            <i class="fas fa-eye"></i>
                        </span>
                    </div>
                </div>

                <!-- Mensajes de error -->
                <?php if (isset($_GET['error'])): ?>
                    <div class="error-message">
                        <?php
                        switch ($_GET['error']) {
                            case 'credenciales_incorrectas':
                                echo 'Usuario o contraseña incorrectos';
                                break;
                            case 'campos_vacios':
                                echo 'Por favor, complete todos los campos';
                                break;
                            case 'sesion_expirada':
                                echo 'Su sesión ha expirado';
                                break;
                            default:
                                echo 'Error de acceso';
                        }
                        ?>
                    </div>
                <?php endif; ?>

                <!-- Botón login -->
                <input type="submit" class="btn" value="Iniciar Sesión">
                
                <div class="info-usuario">
                    <small>Derechos reservados a "Shadow07" Tecnm......</small><br>
                </div>
            </form>
        </div>
    </div>

    <!-- JS para mostrar/ocultar contraseña -->
    <script>
        const togglePassword = document.querySelector("#togglePassword");
        const passwordField = document.querySelector("#password");

        togglePassword.addEventListener("click", function () {
            const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
            passwordField.setAttribute("type", type);

            // Cambia el ícono
            this.innerHTML = type === "password"
                ? '<i class="fas fa-eye"></i>'
                : '<i class="fas fa-eye-slash"></i>';
        });
    </script>
</body>
</html>
