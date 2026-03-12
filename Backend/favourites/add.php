<?php
header("Content-Type: application/json");
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';

// ✅ CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// ✅ Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 🛡 Method validation → Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "msg" => "Method Not Allowed. Use POST."
    ]);
    exit;
}

// 🔑 Authenticate user
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "msg" => "Unauthorized"]);
    exit;
}

// 🔹 Support JSON body
if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $_POST[$key] = $value;
        }
    }
}

// 🔹 Validate required field
if (!isset($_POST['property_id']) || empty($_POST['property_id'])) {
    echo json_encode(["success" => false, "msg" => "Missing property_id"]);
    exit;
}

$user_id     = intval($user['user_id']);
$property_id = intval($_POST['property_id']);

// 🔑 Admin override to add favourites for another user
if ($user['role'] === 'admin' && isset($_POST['user_id'])) {
    $user_id = intval($_POST['user_id']);
}

// 🔹 Check property exists
$chk = $conn->prepare("SELECT property_id FROM properties WHERE property_id=? LIMIT 1");
$chk->bind_param("i", $property_id);
$chk->execute();
$chk->store_result();
if ($chk->num_rows === 0) {
    echo json_encode(["success" => false, "msg" => "Property not found"]);
    $chk->close();
    exit;
}
$chk->close();

// 🔹 Prevent duplicate favourite
$dup = $conn->prepare("SELECT fav_id FROM favourites WHERE user_id=? AND property_id=? LIMIT 1");
$dup->bind_param("ii", $user_id, $property_id);
$dup->execute();
$dup->store_result();
if ($dup->num_rows > 0) {
    echo json_encode(["success" => false, "msg" => "Already in favourites"]);
    $dup->close();
    exit;
}
$dup->close();

// 🔹 Insert favourite
$stmt = $conn->prepare("INSERT INTO favourites (user_id, property_id) VALUES (?, ?)");
$stmt->bind_param("ii", $user_id, $property_id);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "msg" => "Added to favourites",
        "fav_id" => $stmt->insert_id
    ]);
} else {
    echo json_encode(["success" => false, "msg" => $stmt->error]);
}

$stmt->close();
$conn->close();
