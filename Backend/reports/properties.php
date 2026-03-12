<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';
header('Content-Type: application/json');

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ✅ Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed. Use GET."
    ]);
    exit;
}

// ✅ JWT validate + admin check
$userData = get_authenticated_user();
if (!$userData) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Invalid or missing token"]);
    exit;
}
if (($userData['role'] ?? null) !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Access denied, admin only"]);
    exit;
}

// 🔹 Properties by category
$sql1 = "SELECT pc.category_name, COUNT(p.property_id) AS total
         FROM properties p
         LEFT JOIN property_categories pc ON p.category_id = pc.category_id
         GROUP BY pc.category_id";
$res1 = $conn->query($sql1);
$labels1 = []; $data1 = [];
while ($r = $res1->fetch_assoc()) {
    $labels1[] = $r['category_name'] ?? 'Unknown';
    $data1[] = (int)$r['total'];
}

// 🔹 Properties by type
$sql2 = "SELECT pt.type_name, COUNT(p.property_id) AS total
         FROM properties p
         LEFT JOIN property_types pt ON p.type_id = pt.type_id
         GROUP BY pt.type_id";
$res2 = $conn->query($sql2);
$labels2 = []; $data2 = [];
while ($r = $res2->fetch_assoc()) {
    $labels2[] = $r['type_name'] ?? 'Unknown';
    $data2[] = (int)$r['total'];
}

// 🔹 Top priced properties
$sql3 = "SELECT property_name, price FROM properties
         WHERE price IS NOT NULL
         ORDER BY price DESC
         LIMIT 10";
$res3 = $conn->query($sql3);
$labels3 = []; $data3 = [];
while ($r = $res3->fetch_assoc()) {
    $labels3[] = $r['property_name'];
    $data3[] = (float)$r['price'];
}

// ✅ Final JSON response
echo json_encode([
    "status" => "success",
    "data" => [
        "properties_by_category" => [
            "labels" => $labels1,
            "datasets" => [
                ["label" => "Properties", "data" => $data1]
            ]
        ],
        "properties_by_type" => [
            "labels" => $labels2,
            "datasets" => [
                ["label" => "Properties", "data" => $data2]
            ]
        ],
        "top_priced_properties" => [
            "labels" => $labels3,
            "datasets" => [
                ["label" => "Price", "data" => $data3]
            ]
        ]
    ]
]);

$conn->close();
