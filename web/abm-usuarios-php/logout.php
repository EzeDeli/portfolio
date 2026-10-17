<?php
require_once 'includes/funciones.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verificar_csrf();

    $_SESSION = [];
    session_destroy();
}

header('Location: login.php');
exit();
