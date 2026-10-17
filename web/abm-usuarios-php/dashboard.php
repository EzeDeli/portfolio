<?php
require_once 'includes/funciones.php';
requerir_login();

$total = $conexion->query('SELECT COUNT(*) AS total FROM usuario')->fetch_assoc()['total'];

$titulo = 'Inicio';
require 'includes/encabezado.php';
?>

<h1 class="h3 mb-4">Hola, <?= e($_SESSION['usuario_nombre']) ?></h1>

<div class="row g-3">
    <div class="col-sm-6">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <div class="text-muted small">Usuarios registrados</div>
                <div class="display-6"><?= (int) $total ?></div>
                <a class="btn btn-primary mt-3" href="usuarios.php">Ver usuarios</a>
            </div>
        </div>
    </div>
    <div class="col-sm-6">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <div class="text-muted small">Alta rápida</div>
                <p class="mb-0">Cargá un usuario nuevo desde el panel.</p>
                <a class="btn btn-success mt-3" href="crear.php">Crear usuario</a>
            </div>
        </div>
    </div>
</div>

<?php require 'includes/pie.php'; ?>
