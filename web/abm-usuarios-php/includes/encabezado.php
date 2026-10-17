<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($titulo ?? 'ABM de usuarios') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

<?php if (isset($_SESSION['usuario_id'])): ?>
<nav class="navbar navbar-dark bg-dark mb-4">
    <div class="container">
        <a class="navbar-brand" href="dashboard.php">ABM de usuarios</a>
        <div class="d-flex align-items-center gap-3">
            <span class="text-light small"><?= e($_SESSION['usuario_nombre']) ?></span>
            <form method="POST" action="logout.php" class="m-0">
                <?= campo_csrf() ?>
                <button class="btn btn-outline-light btn-sm">Cerrar sesión</button>
            </form>
        </div>
    </div>
</nav>
<?php endif; ?>

<main class="container" style="max-width: 760px;">

<?php if (!empty($errores)): ?>
    <div class="alert alert-danger">
        <?php foreach ($errores as $error): ?>
            <div><?= e($error) ?></div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
