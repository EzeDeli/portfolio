<?php
require_once 'includes/funciones.php';
requerir_login();

// Solo por POST y con token: un link o una imagen de otro sitio no pueden borrar
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Metodo no permitido.');
}
verificar_csrf();

$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

// Nadie puede borrarse a si mismo y quedarse con la sesion de un usuario inexistente
if ($id && $id !== (int) $_SESSION['usuario_id']) {
    $stmt = $conexion->prepare('DELETE FROM usuario WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
}

header('Location: usuarios.php?ok=eliminado');
exit();
