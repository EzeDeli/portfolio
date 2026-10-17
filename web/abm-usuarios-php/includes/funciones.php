<?php
session_start([
    'cookie_httponly' => true,   // el JavaScript de la pagina no puede leer la cookie
    'cookie_samesite' => 'Lax',  // no viaja en pedidos que vienen de otro sitio
]);

require_once __DIR__ . '/../config/conexion.php';

// Escapa texto antes de mostrarlo en el HTML (evita XSS)
function e(?string $texto): string
{
    return htmlspecialchars($texto ?? '', ENT_QUOTES, 'UTF-8');
}

function requerir_login(): void
{
    if (!isset($_SESSION['usuario_id'])) {
        header('Location: login.php');
        exit();
    }
}

// Token CSRF: cada formulario que modifica datos lo manda, y se verifica antes
// de tocar la base. Asi un link o formulario de otro sitio no puede borrar ni
// editar usuarios en nombre de alguien con la sesion abierta.
function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function campo_csrf(): string
{
    return '<input type="hidden" name="csrf" value="' . csrf_token() . '">';
}

function verificar_csrf(): void
{
    if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
        http_response_code(403);
        exit('Pedido invalido. Volve a cargar la pagina e intenta de nuevo.');
    }
}

// Valida nombre, email y (si se pide) contraseña. Devuelve la lista de errores.
function validar_usuario(string $nombre, string $email, ?string $password = null): array
{
    $errores = [];

    if ($nombre === '' || mb_strlen($nombre) > 100) {
        $errores[] = 'El nombre es obligatorio y puede tener hasta 100 caracteres.';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
        $errores[] = 'El email no es valido.';
    }
    if ($password !== null && mb_strlen($password) < 6) {
        $errores[] = 'La contraseña debe tener al menos 6 caracteres.';
    }

    return $errores;
}

// Crea un usuario. Devuelve null si salio bien, o el mensaje de error.
function crear_usuario(mysqli $conexion, string $nombre, string $email, string $password): ?string
{
    $hash = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $conexion->prepare('INSERT INTO usuario (nombre, email, password_hash) VALUES (?, ?, ?)');
        $stmt->bind_param('sss', $nombre, $email, $hash);
        $stmt->execute();
        return null;
    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() === 1062) {
            return 'Ese email ya esta registrado.';
        }
        error_log($e->getMessage());
        return 'No se pudo crear el usuario.';
    }
}
