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
    echo json_encode(["status" => "error", "message" => "Method not allowed. Use GET."]);
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

// 1) Enquiries per property (top 20)
$sql1 = "SELECT p.property_name, COUNT(e.enquiry_id) AS total
         FROM enquiries e
         JOIN properties p ON e.property_id = p.property_id
         GROUP BY e.property_id
         ORDER BY total DESC
         LIMIT 20";
$res1 = $conn->query($sql1);
$labels1 = [];
$data1 = [];
while ($r = $res1->fetch_assoc()) {
    $labels1[] = $r['property_name'];
    $data1[] = (int)$r['total'];
}

// 2) Enquiries per day (last 30 days)
$sql2 = "SELECT DATE(created_at) AS dt, COUNT(*) AS total
         FROM enquiries
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
         GROUP BY dt
         ORDER BY dt ASC";
$res2 = $conn->query($sql2);

// Build full 30-day series (fill zeros)
$period = [];
for ($i = 29; $i >= 0; $i--) {
    $d = date('Y-m-d', strtotime("-{$i} days"));
    $period[$d] = 0;
}
while ($r = $res2->fetch_assoc()) {
    $period[$r['dt']] = (int)$r['total'];
}
$labels2 = array_keys($period);
$data2 = array_values($period);

// ✅ Output JSON
echo json_encode([
    "status" => "success",
    "data" => [
        "enquiries_per_property" => [
            "labels" => $labels1,
            "datasets" => [
                ["label" => "Enquiries", "data" => $data1]
            ]
        ],
        "enquiries_per_day" => [
            "labels" => $labels2,
            "datasets" => [
                ["label" => "Enquiries (last 30 days)", "data" => $data2]
            ]
        ]
    ]
]);
$conn->close();
