<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';
header("Content-Type: application/json");

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// 🔒 Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "msg" => "Method Not Allowed. Use POST."
    ]);
    exit;
}

// 🧾 Authenticate user
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "msg" => "Unauthorized"]);
    exit;
}

// 📥 Accept JSON or form-data
$data = $_POST;
if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $json = json_decode(file_get_contents("php://input"), true);
    if (is_array($json)) $data = $json;
}

// ✅ Validate input
if (empty($data['property_id']) || empty(trim($data['message']))) {
    echo json_encode(["success" => false, "msg" => "Missing property_id or message"]);
    exit;
}

$user_id     = intval($user['user_id']);
$property_id = intval($data['property_id']);
$message     = trim($data['message']);

// ✅ Check if property exists
$prop = $conn->prepare("SELECT property_id FROM properties WHERE property_id=? LIMIT 1");
$prop->bind_param("i", $property_id);
$prop->execute();
$res = $prop->get_result();
if ($res->num_rows === 0) {
    echo json_encode(["success" => false, "msg" => "Property not found"]);
    exit;
}
$prop->close();

// ✅ Admin bypass
if ($user['role'] === 'admin') {
    $stmt = $conn->prepare("INSERT INTO enquiries (user_id, property_id, message) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $user_id, $property_id, $message);
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "msg" => "Enquiry sent (Admin bypass)"]);
    } else {
        echo json_encode(["success" => false, "msg" => $stmt->error]);
    }
    exit;
}

// ✅ Free enquiries limit (3)
$check = $conn->prepare("SELECT COUNT(*) as total FROM enquiries WHERE user_id=?");
$check->bind_param("i", $user_id);
$check->execute();
$total = $check->get_result()->fetch_assoc()['total'];
$check->close();

if ($total >= 3) {
    $today = date('Y-m-d');
    $sub = $conn->prepare("SELECT sub_id FROM subscriptions 
                           WHERE user_id=? AND status='active' AND end_date >= ? LIMIT 1");
    $sub->bind_param("is", $user_id, $today);
    $sub->execute();
    $sub->store_result();
    if ($sub->num_rows === 0) {
        echo json_encode(["success" => false, "msg" => "Free limit reached. Please subscribe."]);
        exit;
    }
    $sub->close();
}

// ✅ Insert enquiry (safe)
$stmt = $conn->prepare("INSERT INTO enquiries (user_id, property_id, message) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $user_id, $property_id, $message);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "msg" => "Enquiry sent"]);
} else {
    echo json_encode(["success" => false, "msg" => $stmt->error]);
}
