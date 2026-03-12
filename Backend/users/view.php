<?php
require '../config/db.php';
require '../config/jwt.php';

header("Content-Type: application/json");

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


/* ================= METHOD CHECK ================= */

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "msg" => "Method not allowed. Use GET."
    ]);
    exit;
}

/* ================= AUTH ================= */

$user = get_authenticated_user();

if (!$user) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "msg" => "Invalid or missing token"
    ]);
    exit;
}

/* ================= ROLE BASED TARGET ================= */

if ($user['role'] === 'admin') {

    // Admin can view any user using ?id=
    if (isset($_GET['id']) && is_numeric($_GET['id'])) {
        $targetId = intval($_GET['id']);
    } else {
        // If id not provided → admin own profile
        $targetId = intval($user['user_id']);
    }

} else {

    // Normal user → only own profile
    $targetId = intval($user['user_id']);
}

/* ================= FETCH USER ================= */

$stmt = $conn->prepare("
    SELECT user_id, name, email, phone, role, created_at
    FROM users
    WHERE user_id = ?
");

$stmt->bind_param("i", $targetId);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "msg" => "User not found"
    ]);
    exit;
}

$userData = $res->fetch_assoc();

/* ================= RESPONSE ================= */

echo json_encode([
    "success" => true,
    "viewed_by" => $user['role'], // admin or user
    "data" => $userData
]);

$stmt->close();
$conn->close();