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

// 🔹 Revenue by plan
$sql1 = "SELECT pl.plan_name, COALESCE(SUM(s.amount),0) AS total_revenue
         FROM subscriptions s
         JOIN plans pl ON s.plan_id = pl.plan_id
         GROUP BY pl.plan_id";
$res1 = $conn->query($sql1);
$labels1 = []; $data1 = [];
while ($r = $res1->fetch_assoc()) {
    $labels1[] = $r['plan_name'];
    $data1[] = (float)$r['total_revenue'];
}

// 🔹 Revenue over last 12 months (YYYY-MM)
$sql2 = "SELECT DATE_FORMAT(start_date, '%Y-%m') AS ym, COALESCE(SUM(amount),0) AS total
         FROM subscriptions
         WHERE start_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH),'%Y-%m-01')
         GROUP BY ym
         ORDER BY ym ASC";
$res2 = $conn->query($sql2);

// Fill months map (last 12 months)
$months = [];
for ($i = 11; $i >= 0; $i--) {
    $m = date('Y-m', strtotime("-{$i} months"));
    $months[$m] = 0.0;
}
while ($r = $res2->fetch_assoc()) {
    $months[$r['ym']] = (float)$r['total'];
}
$labels2 = array_keys($months);
$data2 = array_values($months);

// ✅ Final JSON response
echo json_encode([
    "status" => "success",
    "data" => [
        "revenue_by_plan" => [
            "labels" => $labels1,
            "datasets" => [
                ["label" => "Revenue", "data" => $data1]
            ]
        ],
        "revenue_over_time" => [
            "labels" => $labels2,
            "datasets" => [
                ["label" => "Revenue (last 12 months)", "data" => $data2]
            ]
        ]
    ]
]);

$conn->close();
