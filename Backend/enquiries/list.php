<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';
header("Content-Type: application/json");


header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// ✅ Preflight handle
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 🔒 Allow only GET
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

try {
    // ✅ Fetch enquiries with user & property details
    $sql = "SELECT e.enquiry_id, e.message, e.created_at, 
               u.user_id, u.name AS user_name, u.phone AS mobile,
               p.property_id, p.property_name
        FROM enquiries e
        JOIN users u ON e.user_id = u.user_id
        JOIN properties p ON e.property_id = p.property_id
        ORDER BY e.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "success" => true,
        "count"   => count($data),
        "data"    => $data
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "msg"     => "Error fetching enquiries",
        "error"   => $e->getMessage()
    ]);
}
