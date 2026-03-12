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


// 🛡 Method validation → Allow only GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "msg" => "Method Not Allowed. Use GET."
    ]);
    exit;
}

// 🔑 Authenticate
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "msg" => "Unauthorized"]);
    exit;
}

// 🔑 Role check
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "msg" => "Access denied"]);
    exit;
}

// ✅ Validate enquiry_id
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "msg" => "Missing or invalid enquiry_id"]);
    exit;
}

$enquiry_id = intval($_GET['id']);

try {
    $sql = "SELECT e.enquiry_id, e.message, e.created_at, 
               u.user_id, u.name AS user_name, u.email AS user_email, u.phone AS mobile,
               p.property_id, p.property_name
        FROM enquiries e
        JOIN users u ON e.user_id = u.user_id
        JOIN properties p ON e.property_id = p.property_id
        WHERE e.enquiry_id = ?
        LIMIT 1";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $enquiry_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            "success" => true,
            "data"    => $row
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "msg"     => "Enquiry not found"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "msg"     => "Error fetching enquiry",
        "error"   => $e->getMessage()
    ]);
}
