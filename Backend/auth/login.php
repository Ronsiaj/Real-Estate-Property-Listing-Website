<?php
require '../config/db.php';
require '../config/jwt.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ✅ Method validation - only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        "success" => false,
        "msg" => "Invalid request method. Only POST allowed."
    ]);
    exit;
}

// ✅ Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

// ✅ Check required fields
if (empty($data['email']) || empty($data['password'])) {
    echo json_encode(["success" => false, "msg" => "All fields are required"]);
    exit;
}

// ✅ Convert inputs safely
$email = strtolower(trim($conn->real_escape_string($data['email'])));
$passwordPlain = trim($data['password']); // Keep original for verification

// ✅ Email format validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "msg" => "Invalid email format"]);
    exit;
}

// ✅ Fetch user
$sql = "SELECT * FROM users WHERE email='$email' LIMIT 1";
$res = $conn->query($sql);

if ($res->num_rows == 0) {
    echo json_encode(["success" => false, "msg" => "Invalid credentials"]);
    exit;
}

$user = $res->fetch_assoc();

// ✅ Verify password
if (!password_verify($passwordPlain, $user['password'])) {
    echo json_encode(["success" => false, "msg" => "Invalid credentials"]);
    exit;
}


// ✅ Update last login time
$updateLogin = $conn->prepare("
    UPDATE users
    SET last_login = NOW()
    WHERE user_id = ?
");
$updateLogin->bind_param("i", $user['user_id']);
$updateLogin->execute();
$updateLogin->close();

// ✅ Generate JWT
$payload = [
    "user_id" => $user['user_id'],
    "role" => $user['role'],
    "email" => $user['email'],
    "phone" => $user['phone']
];
$token = generate_jwt($payload);

// ✅ Response
echo json_encode([
    "success" => true,
    "msg" => "Login successful",
    "user_id" => $user['user_id'],
    "role" => $user['role'],
    "token" => $token
]);
