<?php
require '../config/db.php';
require '../config/jwt.php';

header("Content-Type: application/json");

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "msg" => "Method not allowed. Use POST."]);
    exit;
}

// 🔒 Authenticate user
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "msg" => "Invalid or missing token"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true) ?? [];

// ✅ ONLY LOGGED USER CAN UPDATE THEMSELF
$targetId = intval($user['user_id']);

// ✅ Validate required fields
if (empty($data['name']) || empty($data['email']) || empty($data['phone'])) {
    echo json_encode(["success" => false, "msg" => "Name, email, and phone are required"]);
    exit;
}

$name  = trim($data['name']);
$email = strtolower(trim($data['email']));
$phone = trim($data['phone']);

// ✅ Validate email and phone
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "msg" => "Invalid email"]);
    exit;
}

if (!preg_match("/^\+?[0-9]{7,20}$/", $phone)) {
    echo json_encode(["success" => false, "msg" => "Invalid phone"]);
    exit;
}

// ✅ Check duplicates
$stmt = $conn->prepare("SELECT user_id FROM users WHERE (email=? OR phone=?) AND user_id!=?");
$stmt->bind_param("ssi", $email, $phone, $targetId);
$stmt->execute();

if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(["success" => false, "msg" => "Email or phone already exists"]);
    exit;
}
$stmt->close();

// ✅ Update
$stmt = $conn->prepare("UPDATE users SET name=?, email=?, phone=? WHERE user_id=?");
$stmt->bind_param("sssi", $name, $email, $phone, $targetId);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "msg" => "Profile updated successfully",
        "updated_user_id" => $targetId
    ]);
} else {
    echo json_encode(["success" => false, "msg" => $conn->error]);
}

$stmt->close();
$conn->close();
