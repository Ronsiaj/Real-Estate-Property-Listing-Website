<?php
header("Content-Type: application/json");
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// 🛡 Allow only GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "msg"     => "Method Not Allowed. Use GET."
    ]);
    exit;
}

try {
    $sql = "SELECT plan_id, plan_name, price, duration_days 
            FROM plans 
            ORDER BY plan_id ASC";
    $res = $conn->query($sql);

    $plans = [];
    while ($row = $res->fetch_assoc()) {
        $plans[] = $row;
    }

    echo json_encode([
        "success" => true,
        "count"   => count($plans),
        "plans"   => $plans
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "msg"     => "Error fetching plans",
        "error"   => $e->getMessage()
    ]);
}

$conn->close();
