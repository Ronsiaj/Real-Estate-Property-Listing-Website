<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';
header("Content-Type: application/json");


// ✅ CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// ✅ Handle Preflight (IMPORTANT)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Allow only POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        "success" => false,
        "msg" => "Method not allowed. Use POST."
    ]);
    exit;
}

// Optional auth (guest allowed)
$user = get_authenticated_user();

// Get request body
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['property_id'])) {
    http_response_code(400); // Bad Request
    echo json_encode([
        "success" => false,
        "msg" => "Missing property_id"
    ]);
    exit;
}

$property_id = intval($data['property_id']);
$user_id = $user ? intval($user['user_id']) : null;

// ✅ Prepared statement to safely insert
$stmt = $conn->prepare("INSERT INTO property_views (user_id, property_id) VALUES (?, ?)");
$stmt->bind_param("ii", $user_id, $property_id); // if $user_id is null, MySQL accepts it

if ($stmt->execute()) {
    echo json_encode(["success" => true, "msg" => "View recorded"]);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "msg" => "DB error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
