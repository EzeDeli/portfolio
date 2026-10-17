<?php
require_once 'includes/funciones.php';
requerir_login();

$usuarios = $conexion->query('SELECT id, nombre, email, creado_en FROM usuario ORDER BY nombre')->fetch_all(MYSQLI_ASSOC);

$mensajes = [
    'creado'    => 'Usuario creado.',
    'editado'   => 'Cambios guardados.',
    'eliminado' => 'Usuario eliminado.',
];
$ok = $mensajes[$_GET['ok'] ?? ''] ?? null;

$titulo = 'Usuarios';
require 'includes/encabezado.php';
?>

<div class="d-flex justify-content-between align-items-center mb-3">
    <h1 class="h3 m-0">Usuarios</h1>
    <a class="btn btn-success" href="crear.php">+ Nuevo usuario</a>
</div>

<?php if ($ok): ?>
    <div class="alert alert-success"><?= e($ok) ?></div>
<?php endif; ?>

<div class="card shadow-sm">
    <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
            <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Alta</th>
                <th class="text-end">Acciones</th>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($usuarios as $u): ?>
            <tr>
                <td><?= e($u['nombre']) ?></td>
                <td><?= e($u['email']) ?></td>
                <td class="small text-muted"><?= e(date('d/m/Y', strtotime($u['creado_en']))) ?></td>
                <td class="text-end">
                    <a class="btn btn-outline-primary btn-sm" href="editar.php?id=<?= (int) $u['id'] ?>">Editar</a>
                    <?php if ((int) $u['id'] !== (int) $_SESSION['usuario_id']): ?>
                        <!-- Eliminar va por POST con token: un link no puede borrar -->
                        <form method="POST" action="eliminar.php" class="d-inline"
                              onsubmit="return confirm('¿Seguro que querés eliminar a <?= e($u['nombre']) ?>?')">
                            <?= campo_csrf() ?>
                            <input type="hidden" name="id" value="<?= (int) $u['id'] ?>">
                            <button class="btn btn-outline-danger btn-sm">Eliminar</button>
                        </form>
                    <?php endif; ?>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require 'includes/pie.php'; ?>
