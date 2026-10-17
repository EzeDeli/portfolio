<?php
require_once 'includes/funciones.php';
requerir_login();

$errores = [];
$nombre = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verificar_csrf();

    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $errores = validar_usuario($nombre, $email, $password);

    if (!$errores) {
        $error = crear_usuario($conexion, $nombre, $email, $password);
        if (!$error) {
            header('Location: usuarios.php?ok=creado');
            exit();
        }
        $errores[] = $error;
    }
}

$titulo = 'Crear usuario';
require 'includes/encabezado.php';
?>

<h1 class="h3 mb-4">Crear usuario</h1>

<div class="card shadow-sm">
    <div class="card-body">
        <form method="POST">
            <?= campo_csrf() ?>
            <div class="mb-3">
                <label class="form-label" for="nombre">Nombre</label>
                <input class="form-control" type="text" id="nombre" name="nombre" value="<?= e($nombre) ?>" maxlength="100" required>
            </div>
            <div class="mb-3">
                <label class="form-label" for="email">Email</label>
                <input class="form-control" type="email" id="email" name="email" value="<?= e($email) ?>" maxlength="150" required>
            </div>
            <div class="mb-4">
                <label class="form-label" for="password">Contraseña</label>
                <input class="form-control" type="password" id="password" name="password" minlength="6" required>
            </div>
            <button class="btn btn-success">Crear usuario</button>
            <a class="btn btn-link" href="usuarios.php">Cancelar</a>
        </form>
    </div>
</div>

<?php require 'includes/pie.php'; ?>
