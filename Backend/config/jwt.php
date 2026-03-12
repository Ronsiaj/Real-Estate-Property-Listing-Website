<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once __DIR__ . '/../vendor/autoload.php'; // make sure composer installed firebase/php-jwt

$JWT_SECRET = "your_super_secret_key_here"; // 🔑 change this to a strong secret key

// Generate token
function generate_jwt($payload, $exp_minutes = 60) {
    global $JWT_SECRET;
    $issuedAt   = time();
    $expire     = $issuedAt + ($exp_minutes * 60);
    $payload['iat'] = $issuedAt;
    $payload['exp'] = $expire;

    return JWT::encode($payload, $JWT_SECRET, 'HS256');
}

// Validate token
function validate_jwt($token) {
    global $JWT_SECRET;
    try {
        $decoded = JWT::decode($token, new Key($JWT_SECRET, 'HS256'));
        return (array) $decoded;
    } catch (Exception $e) {
        return false;
    }
}

// Middleware helper (to get user from Authorization header)
function get_authenticated_user() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) return false;

    if (!preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) return false;

    $token = $matches[1];
    return validate_jwt($token);
}
