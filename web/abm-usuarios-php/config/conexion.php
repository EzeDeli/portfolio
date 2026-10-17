<?php
// Datos de conexion. Se pueden pisar con variables de entorno para no dejar
// credenciales en el codigo; los valores por defecto son los de XAMPP.
$host     = getenv('DB_HOST') ?: 'localhost';
$usuario  = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$database = getenv('DB_NAME') ?: 'abm_usuarios';

// Que mysqli lance excepciones en vez de devolver false en silencio
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conexion = new mysqli($host, $usuario, $password, $database);
    $conexion->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    // El detalle va al log; al usuario no se le muestran datos internos
    error_log('Error de conexion: ' . $e->getMessage());
    http_response_code(500);
    exit('No se pudo conectar con la base de datos.');
}
