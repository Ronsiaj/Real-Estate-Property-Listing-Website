<?php
header("Content-Type: application/json");

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ✅ Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        "success" => false,
        "msg" => "Method not allowed. Use POST."
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

// ✅ Check required POST parameter
if (!isset($_POST['plan_id'])) {
    echo json_encode(["success" => false, "msg" => "Missing plan_id"]);
    exit;
}

$plan_id = intval($_POST['plan_id']);

// ✅ Get plan details
$plan_stmt = $conn->prepare("SELECT price, duration_days FROM plans WHERE plan_id=?");
$plan_stmt->bind_param("i", $plan_id);
$plan_stmt->execute();
$plan_res = $plan_stmt->get_result();

if ($plan_res->num_rows === 0) {
    echo json_encode(["success" => false, "msg" => "Invalid plan"]);
    $plan_stmt->close();
    exit;
}

$plan = $plan_res->fetch_assoc();
$plan_stmt->close();

// ✅ Insert subscription
$sub_stmt = $conn->prepare(
    "INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status, amount, payment_status) 
     VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'active', ?, 'success')"
);
$sub_stmt->bind_param("iiid", $user['user_id'], $plan_id, $plan['duration_days'], $plan['price']);
$sub_stmt->execute();
$sub_stmt->close();

echo json_encode(["success" => true, "msg" => "Subscribed successfully (manual)"]);

$conn->close();
