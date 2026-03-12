<?php
header("Content-Type: application/json");

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';

// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ only GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success"=>false,"msg"=>"Use GET"]);
    exit;
}

// ✅ auth
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success"=>false,"msg"=>"Unauthorized"]);
    exit;
}

$user_id = $user['user_id'];
$role    = $user['role'];

// pagination
$limit  = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

// 🔥 ROLE BASED QUERY
if ($role === 'admin') {

    // admin → all properties
    $where = "1=1";
    $types = "";
    $params = [];

} else {

    // user → only own properties
    $where = "p.user_id = ?";
    $types = "i";
    $params[] = $user_id;
}

// count query
$countSql = "SELECT COUNT(*) as total FROM properties p WHERE $where";
$countStmt = $conn->prepare($countSql);

if (!empty($types)) {
    $countStmt->bind_param($types, ...$params);
}

$countStmt->execute();
$countRes = $countStmt->get_result()->fetch_assoc();
$total = intval($countRes['total']);
$countStmt->close();

// data query
$sql = "
SELECT p.*,
       c.category_name,
       t.type_name
FROM properties p
LEFT JOIN property_categories c ON p.category_id = c.category_id
LEFT JOIN property_types t ON p.type_id = t.type_id
WHERE $where
ORDER BY p.property_id DESC
LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($sql);

// bind params
if ($role === 'admin') {
    $stmt->bind_param("ii", $limit, $offset);
} else {
    $stmt->bind_param("iii", $user_id, $limit, $offset);
}

$stmt->execute();
$res = $stmt->get_result();

$data = [];

while ($row = $res->fetch_assoc()) {

    // 🔥 decode JSON safely
    $row['gallery_imgs']       = json_decode($row['gallery_imgs'], true) ?: [];
    $row['property_documents'] = json_decode($row['property_documents'], true) ?: [];
    $row['amenities']          = json_decode($row['amenities'], true) ?: [];

    $data[] = $row;
}

$stmt->close();
$conn->close();

// ✅ response
echo json_encode([
    "success" => true,
    "count"   => $total,
    "data"    => $data
]);