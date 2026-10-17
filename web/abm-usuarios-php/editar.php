<?php
require_once 'includes/funciones.php';
requerir_login();

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

$stmt = $conexion->prepare('SELECT id, nombre, email FROM usuario WHERE id = ?');
$stmt->bind_param('i', $id);
$stmt->execute();
$usuario = $stmt->get_result()->fetch_assoc();

if (!$usuario) {
    http_response_code(404);
    exit('El usuario no existe.');
}

$errores = [];
$nombre = $usuario['nombre'];
$email = $usuario['email'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verificar_csrf();

    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');

    $errores = validar_usuario($nombre, $email);

    if (!$errores) {
        try {
            $stmt = $conexion->prepare('UPDATE usuario SET nombre = ?, email = ? WHERE id = ?');
            $stmt->bind_param('ssi', $nombre, $email, $id);
            $stmt->execute();

            // Si se edito a si mismo, se actualiza el nombre que muestra la barra
            if ($id === (int) $_SESSION['usuario_id']) {
                $_SESSION['usuario_nombre'] = $nombre;
            }

            header('Location: usuarios.php?ok=editado');
            exit();
        } catch (mysqli_sql_exception $e) {
            $errores[] = $e->getCode() === 1062 ? 'Ese email ya esta registrado.' : 'No se pudieron guardar los cambios.';
        }
    }
}

$titulo = 'Editar usuario';
require 'includes/encabezado.php';
?>

<h1 class="h3 mb-4">Editar usuario</h1>

<div class="card shadow-sm">
    <div class="card-body">
        <form method="POST">
            <?= campo_csrf() ?>
            <div class="mb-3">
                <label class="form-label" for="nombre">Nombre</label>
                <input class="form-control" type="text" id="nombre" name="nombre" value="<?= e($nombre) ?>" maxlength="100" required>
            </div>
            <div class="mb-4">
                <label class="form-label" for="email">Email</label>
                <input class="form-control" type="email" id="email" name="email" value="<?= e($email) ?>" maxlength="150" required>
            </div>
            <button class="btn btn-primary">Guardar cambios</button>
            <a class="btn btn-link" href="usuarios.php">Cancelar</a>
        </form>
    </div>
</div>

<?php require 'includes/pie.php'; ?>
