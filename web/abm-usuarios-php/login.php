<?php
require_once 'includes/funciones.php';

if (isset($_SESSION['usuario_id'])) {
    header('Location: dashboard.php');
    exit();
}

$errores = [];
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verificar_csrf();

    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $stmt = $conexion->prepare('SELECT id, nombre, password_hash FROM usuario WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $usuario = $stmt->get_result()->fetch_assoc();

    // Mismo mensaje si el email no existe o la contraseña esta mal: asi no se
    // puede averiguar que emails estan registrados probando en el login
    if ($usuario && password_verify($password, $usuario['password_hash'])) {
        session_regenerate_id(true);   // sesion nueva al entrar (evita fijacion de sesion)
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_nombre'] = $usuario['nombre'];
        header('Location: dashboard.php');
        exit();
    }

    $errores[] = 'Email o contraseña incorrectos.';
}

$titulo = 'Iniciar sesión';
require 'includes/encabezado.php';
?>

<div class="card shadow-sm mx-auto mt-5" style="max-width: 400px;">
    <div class="card-body p-4">
        <h1 class="h4 mb-4 text-center">Iniciar sesión</h1>

        <form method="POST">
            <?= campo_csrf() ?>
            <div class="mb-3">
                <label class="form-label" for="email">Email</label>
                <input class="form-control" type="email" id="email" name="email" value="<?= e($email) ?>" required autofocus>
            </div>
            <div class="mb-4">
                <label class="form-label" for="password">Contraseña</label>
                <input class="form-control" type="password" id="password" name="password" required>
            </div>
            <button class="btn btn-primary w-100">Entrar</button>
        </form>

        <p class="text-center mt-3 mb-0 small">
            ¿No tenés cuenta? <a href="registro.php">Registrate</a>
        </p>
    </div>
</div>

<?php require 'includes/pie.php'; ?>
