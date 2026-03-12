<?php
require '../config/db.php';
require '../config/jwt.php';
header("Content-Type: application/json");

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// ✅ Preflight request handle
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "msg" => "Method not allowed. Use GET."]);
    exit;
}

// 🔒 Authenticate & check admin role
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "msg" => "Invalid or missing token"]);
    exit;
}
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "msg" => "Admin access required"]);
    exit;
}

// ✅ Query parameters
$q      = isset($_GET['q']) ? trim($_GET['q']) : '';
$page   = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit  = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 5; // max 100
$offset = ($page - 1) * $limit;

$where  = '';
$params = [];
$types  = '';

// ✅ Build WHERE clause for search
if ($q !== '') {
    $where = "WHERE name LIKE ? OR email LIKE ?";
    $params = ["%$q%", "%$q%"];
    $types  = "ss";
}

// ✅ Count total records for pagination
$countSql = "SELECT COUNT(*) AS total FROM users $where";
$countStmt = $conn->prepare($countSql);
if ($where) {
    $countStmt->bind_param($types, ...$params);
}
$countStmt->execute();
$total = $countStmt->get_result()->fetch_assoc()['total'] ?? 0;
$totalPages = $total > 0 ? ceil($total / $limit) : 1;
$countStmt->close();

// ✅ Fetch paginated results (newest first)
$sql = "SELECT user_id, name, email, phone, role, created_at
        FROM users
        $where
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?";
$stmt = $conn->prepare($sql);

if ($where) {
    $types .= "ii";
    $params[] = $limit;
    $params[] = $offset;
    $stmt->bind_param($types, ...$params);
} else {
    $stmt->bind_param("ii", $limit, $offset);
}

$stmt->execute();
$result = $stmt->get_result();
$users = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$conn->close();

// ✅ Respond with data
echo json_encode([
    "success"       => true,
    "page"          => $page,
    "limit"         => $limit,
    "total_pages"   => $totalPages,
    "total_records" => $total,
    "users"         => $users
]);
