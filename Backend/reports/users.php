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

// 🔹 Users by signup month (last 12 months)
$sql1 = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS total
         FROM users
         WHERE created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH),'%Y-%m-01')
         GROUP BY ym
         ORDER BY ym ASC";
$res1 = $conn->query($sql1);

// Fill months map for last 12 months
$months = [];
for ($i = 11; $i >= 0; $i--) {
    $m = date('Y-m', strtotime("-{$i} months"));
    $months[$m] = 0;
}
while ($r = $res1->fetch_assoc()) {
    $months[$r['ym']] = (int)$r['total'];
}
$labels1 = array_keys($months);
$data1 = array_values($months);

// 🔹 Properties per user distribution
$sql2 = "SELECT u.user_id, COUNT(p.property_id) AS prop_count
         FROM users u
         LEFT JOIN properties p ON p.user_id = u.user_id
         GROUP BY u.user_id";
$res2 = $conn->query($sql2);

$buckets = [
    '0' => 0,
    '1' => 0,
    '2-5' => 0,
    '6-10' => 0,
    '10+' => 0
];
while ($r = $res2->fetch_assoc()) {
    $c = (int)$r['prop_count'];
    if ($c === 0) $buckets['0']++;
    else if ($c === 1) $buckets['1']++;
    else if ($c >= 2 && $c <= 5) $buckets['2-5']++;
    else if ($c >= 6 && $c <= 10) $buckets['6-10']++;
    else $buckets['10+']++;
}
$labels2 = array_keys($buckets);
$data2 = array_values($buckets);

// ✅ Final JSON response
echo json_encode([
    "status" => "success",
    "data" => [
        "users_by_signup_month" => [
            "labels" => $labels1,
            "datasets" => [
                ["label" => "New Users (last 12 months)", "data" => $data1]
            ]
        ],
        "properties_per_user_distribution" => [
            "labels" => $labels2,
            "datasets" => [
                ["label" => "Users", "data" => $data2]
            ]
        ]
    ]
]);

$conn->close();
