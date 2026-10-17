<?php
require_once 'includes/funciones.php';

$errores = [];
$nombre = '';
$email = '';
$registrado = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verificar_csrf();

    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $errores = validar_usuario($nombre, $email, $password);

    if (!$errores) {
        $error = crear_usuario($conexion, $nombre, $email, $password);
        if ($error) {
            $errores[] = $error;
        } else {
            $registrado = true;
        }
    }
}

$titulo = 'Registrarse';
require 'includes/encabezado.php';
?>

<div class="card shadow-sm mx-auto mt-5" style="max-width: 400px;">
    <div class="card-body p-4">
        <h1 class="h4 mb-4 text-center">Crear cuenta</h1>

        <?php if ($registrado): ?>
            <div class="alert alert-success">Cuenta creada. Ya podés iniciar sesión.</div>
            <a class="btn btn-primary w-100" href="login.php">Ir al login</a>
        <?php else: ?>
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
                    <div class="form-text">Mínimo 6 caracteres.</div>
                </div>
                <button class="btn btn-success w-100">Registrarme</button>
            </form>
            <p class="text-center mt-3 mb-0 small"><a href="login.php">Volver al login</a></p>
        <?php endif; ?>
    </div>
</div>

<?php require 'includes/pie.php'; ?>
