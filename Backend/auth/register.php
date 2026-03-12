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


// 🔒 Only POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "msg" => "Method not allowed. Use POST."]);
    exit;
}

// 📝 Get JSON body
$data = json_decode(file_get_contents("php://input"), true);

// -------------------------
// 1️⃣ Name validation
// -------------------------
if (empty($data['name'])) {
    echo json_encode(["success" => false, "msg" => "Name is required"]);
    exit;
}
$name = trim($data['name']);

// -------------------------
// 2️⃣ Email validation
// -------------------------
if (empty($data['email'])) {
    echo json_encode(["success" => false, "msg" => "Email is required"]);
    exit;
}
$email = strtolower(trim($data['email']));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "msg" => "Invalid email format"]);
    exit;
}

// -------------------------
// 3️⃣ Password validation
// -------------------------
if (empty($data['password'])) {
    echo json_encode(["success" => false, "msg" => "Password is required"]);
    exit;
}
$passwordPlain = trim($data['password']);
if (!preg_match("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/", $passwordPlain)) {
    echo json_encode([
        "success" => false,
        "msg" => "Password must be at least 6 characters long, include 1 uppercase, 1 lowercase, 1 number, and 1 special character"
    ]);
    exit;
}
$password = password_hash($passwordPlain, PASSWORD_BCRYPT);

// -------------------------
// 4️⃣ Phone validation
// -------------------------
if (empty($data['phone'])) {
    echo json_encode(["success" => false, "msg" => "Phone number is required"]);
    exit;
}
$phone = trim($data['phone']);

// Must be exactly 10 digits
if (!preg_match("/^[0-9]{10}$/", $phone)) {
    echo json_encode(["success" => false, "msg" => "Phone number must be exactly 10 digits"]);
    exit;
}

// -------------------------
// 5️⃣ Duplicate check
// -------------------------
$check = $conn->prepare("SELECT * FROM users WHERE email=? OR phone=?");
$check->bind_param("ss", $email, $phone);
$check->execute();
$result = $check->get_result();
if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "msg" => "Email or phone already exists"]);
    exit;
}
$check->close();

// -------------------------
// 6️⃣ Determine role → first user admin
// -------------------------
$role = "user";
$checkAdmin = $conn->query("SELECT * FROM users WHERE role='admin' LIMIT 1");
if ($checkAdmin->num_rows == 0) $role = "admin";

// -------------------------
// 7️⃣ Insert user
// -------------------------
$stmt = $conn->prepare("INSERT INTO users (name,email,password,phone,role) VALUES (?,?,?,?,?)");
$stmt->bind_param("sssss", $name, $email, $password, $phone, $role);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "msg" => "User registered successfully",
        "user_id" => $stmt->insert_id,
        "role" => $role
    ]);
} else {
    echo json_encode(["success" => false, "msg" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
