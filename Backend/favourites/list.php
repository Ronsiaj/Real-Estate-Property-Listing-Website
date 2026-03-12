<?php
header("Content-Type: application/json");
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';

// ✅ CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// ✅ Preflight
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

// 🔑 Authenticate user
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "msg" => "Unauthorized"]);
    exit;
}

// 🔑 Ownership rule
if ($user['role'] === 'admin' && isset($_GET['user_id'])) {
    $user_id = intval($_GET['user_id']);
} else {
    $user_id = intval($user['user_id']);
}

// 🔹 Pagination defaults
$limit  = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

// 🗄 Fetch favourites
$sql = "
    SELECT f.fav_id,
           f.user_id,
           p.property_id,
           p.property_name,
           p.property_address,
           p.price,
           p.property_thumbnail,
           p.category_id,
           p.type_id,
           f.created_at
    FROM favourites f
    INNER JOIN properties p ON p.property_id = f.property_id
    WHERE f.user_id = ?
    ORDER BY f.fav_id DESC
    LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iii", $user_id, $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$favourites = [];
while ($row = $result->fetch_assoc()) {
    $favourites[] = $row;
}

// ✅ Response
echo json_encode([
    "success" => true,
    "count"   => count($favourites),
    "data"    => $favourites
]);

$stmt->close();
$conn->close();
