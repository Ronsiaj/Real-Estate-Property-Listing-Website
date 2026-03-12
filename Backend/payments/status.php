<?php
header("Content-Type: application/json");

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ✅ Method validation
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        "success" => false,
        "msg" => "Method not allowed. Use GET."
    ]);
    exit;
}

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';

// 🔒 Authenticate user
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "msg" => "Unauthorized"]);
    exit;
}

// ✅ Fetch active subscription
$sql = "SELECT sub_id, plan_id, start_date, end_date, status, payment_status 
        FROM subscriptions 
        WHERE user_id=? AND status='active' 
        AND CURDATE() BETWEEN start_date AND end_date 
        ORDER BY sub_id DESC LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user['user_id']);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    $sub = $res->fetch_assoc();
    echo json_encode(["success" => true, "subscription" => $sub]);
} else {
    echo json_encode(["success" => false, "msg" => "No active subscription"]);
}

$stmt->close();
$conn->close();
