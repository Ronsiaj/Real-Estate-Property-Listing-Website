<?php
header("Content-Type: application/json");
require '../config/db.php'; // centralized DB config

// ✅ CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// ✅ Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ✅ Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        "success" => false,
        "msg" => "Method not allowed. Use GET."
    ]);
    exit;
}

if ($conn->connect_error) {
    echo json_encode(["success" => false, "msg" => $conn->connect_error]);
    exit;
}

// 🔎 Required param
if (!isset($_GET['property_id']) || !is_numeric($_GET['property_id'])) {
    echo json_encode(["success" => false, "msg" => "Missing or invalid property_id"]);
    exit;
}
$property_id = intval($_GET['property_id']);

// 📌 Query with joins
$sql = "SELECT p.*, 
               c.category_name, 
               t.type_name, 
               u.name AS owner_name 
        FROM properties p
        LEFT JOIN property_categories c ON p.category_id = c.category_id
        LEFT JOIN property_types t ON p.type_id = t.type_id
        LEFT JOIN users u ON p.user_id = u.user_id
        WHERE p.property_id = ? 
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $property_id);
$stmt->execute();
$res = $stmt->get_result();
$property = $res->fetch_assoc();
$stmt->close();

if (!$property) {
    echo json_encode(["success" => false, "msg" => "Property not found"]);
    $conn->close();
    exit;
}

// 📝 Decode JSON fields safely
$property['gallery_imgs']       = json_decode($property['gallery_imgs'], true) ?: [];
$property['property_documents'] = json_decode($property['property_documents'], true) ?: [];
$property['amenities']          = json_decode($property['amenities'], true) ?: [];

// Add thumbnail URL alias
$property['thumbnail_url'] = $property['property_thumbnail'];

// ✅ Final response
echo json_encode([
    "success"  => true,
    "property" => $property
]);

$conn->close();
