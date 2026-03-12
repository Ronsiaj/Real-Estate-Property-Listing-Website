<?php
require __DIR__ . '/../config/db.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ✅ Allow only GET method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "msg" => "Method not allowed. Use GET."
    ]);
    exit;
}

// ✅ Query top 10 viewed properties (OPEN API)
$sql = "SELECT p.property_name, COUNT(v.view_id) AS total_views
        FROM property_views v
        JOIN properties p ON v.property_id = p.property_id
        GROUP BY v.property_id
        ORDER BY total_views DESC
        LIMIT 10";

$res = $conn->query($sql);

if (!$res) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "msg" => "DB error: " . $conn->error
    ]);
    exit;
}

$data = [];
while ($row = $res->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $data
]);

$conn->close();
?>
