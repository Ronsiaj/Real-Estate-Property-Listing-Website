<?php
header("Content-Type: application/json");
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");

// ✅ Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// 🛡 Allow only DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "msg" => "Method Not Allowed. Use DELETE."
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

// 🔹 Support JSON body for DELETE requests
if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $_POST[$key] = $value;
        }
    }
}

// 🔹 Validate input
if (!isset($_POST['property_id']) || empty($_POST['property_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "msg" => "Missing property_id"]);
    exit;
}

$user_id     = intval($user['user_id']);
$property_id = intval($_POST['property_id']);

// 🔑 Admin override (optional)
if ($user['role'] === 'admin' && isset($_POST['user_id'])) {
    $user_id = intval($_POST['user_id']);
}

// 🔹 Check if favourite exists
$chk = $conn->prepare("SELECT fav_id FROM favourites WHERE user_id=? AND property_id=? LIMIT 1");
$chk->bind_param("ii", $user_id, $property_id);
$chk->execute();
$chk->store_result();
if ($chk->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["success" => false, "msg" => "Favourite not found"]);
    $chk->close();
    exit;
}
$chk->close();

// 🔹 Delete favourite
$stmt = $conn->prepare("DELETE FROM favourites WHERE user_id=? AND property_id=?");
$stmt->bind_param("ii", $user_id, $property_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "msg" => "Removed from favourites"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "msg" => $stmt->error]);
}

$stmt->close();
$conn->close();
