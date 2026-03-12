<?php
header("Content-Type: application/json");

// ✅ CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// ✅ Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "msg" => "Method not allowed. Use GET."
    ]);
    exit;
}

require '../config/db.php';

// ✅ DEFINE BASE_URL (localhost + live auto detect)

$host = $_SERVER['HTTP_HOST'];

if (
    strpos($host, 'localhost') !== false ||
    strpos($host, '127.0.0.1') !== false
) {
    define("BASE_URL", "http://localhost/your_backend_file");
} else {
    define("BASE_URL", "https://example.com/your_backend_file");
}


if ($conn->connect_error) {
    die(json_encode(["success" => false, "msg" => $conn->connect_error]));
}

// 📌 Accept filters via GET
$category_id = $_GET['category_id'] ?? null;
$type_id     = $_GET['type_id'] ?? null;
$min_price   = $_GET['min_price'] ?? null;
$max_price   = $_GET['max_price'] ?? null;
$beds        = $_GET['beds'] ?? null;
$baths       = $_GET['baths'] ?? null;
$min_sqft    = $_GET['min_sqft'] ?? null;
$max_sqft    = $_GET['max_sqft'] ?? null;
$amenities   = isset($_GET['amenities']) ? explode(",", $_GET['amenities']) : [];
$search      = $_GET['search'] ?? null;

$page     = max(1, intval($_GET['page'] ?? 1));
$per_page = min(100, max(1, intval($_GET['per_page'] ?? 10)));
$offset   = ($page - 1) * $per_page;

// ✅ Build dynamic filters
$where = ["1=1"];
$types = "";
$vals  = [];

if ($category_id) { $where[]="category_id=?"; $types.="i"; $vals[]=intval($category_id); }
if ($type_id)     { $where[]="type_id=?";     $types.="i"; $vals[]=intval($type_id); }
if ($min_price !== null) { $where[]="price >= ?"; $types.="d"; $vals[]=floatval($min_price); }
if ($max_price !== null) { $where[]="price <= ?"; $types.="d"; $vals[]=floatval($max_price); }
if ($beds)  { $where[]="beds >= ?";  $types.="i"; $vals[]=intval($beds); }
if ($baths) { $where[]="baths >= ?"; $types.="i"; $vals[]=intval($baths); }
if ($min_sqft !== null) { $where[]="sqft >= ?"; $types.="d"; $vals[]=floatval($min_sqft); }
if ($max_sqft !== null) { $where[]="sqft <= ?"; $types.="d"; $vals[]=floatval($max_sqft); }

if ($search) {
    $where[] = "(LOWER(property_name) LIKE ? OR LOWER(property_address) LIKE ? OR LOWER(description) LIKE ?)";
    $types .= "sss";
    $q = "%" . strtolower($search) . "%";
    $vals[]=$q; $vals[]=$q; $vals[]=$q;
}

// Amenities JSON filter
foreach ($amenities as $a) {
    if (!empty($a)) {
        $where[] = "JSON_CONTAINS(amenities, ?)";
        $types .= "s";
        $vals[] = json_encode([$a]);
    }
}

// ✅ Count total results
$sqlCount = "SELECT COUNT(*) AS cnt FROM properties WHERE " . implode(" AND ", $where);
$stmt = $conn->prepare($sqlCount);

if ($types) {
    $a_params = [&$types];
    foreach ($vals as $i => &$v) $a_params[] = &$v;
    call_user_func_array([$stmt, 'bind_param'], $a_params);
}

$stmt->execute();
$total = intval($stmt->get_result()->fetch_assoc()['cnt']);
$stmt->close();

// ✅ Fetch paginated data
$sql = "SELECT property_id, property_name, property_address, price, category_id, type_id, property_thumbnail, beds, baths, sqft
        FROM properties
        WHERE " . implode(" AND ", $where) . "
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?";

$stmt = $conn->prepare($sql);

$typesFetch = $types . "ii";
$valsFetch = $vals;
$valsFetch[] = $per_page;
$valsFetch[] = $offset;

$a_params = [&$typesFetch];
foreach ($valsFetch as $i => &$v) $a_params[] = &$v;
call_user_func_array([$stmt, 'bind_param'], $a_params);

$stmt->execute();
$res = $stmt->get_result();

$list = [];
while ($row = $res->fetch_assoc()) {

    // ✅ Add full image URL
    $row['thumbnail_url'] = !empty($row['property_thumbnail'])
        ? BASE_URL . "/" . $row['property_thumbnail']
        : null;

    $list[] = $row;
}

$stmt->close();

echo json_encode([
    "success"     => true,
    "page"        => $page,
    "per_page"    => $per_page,
    "total"       => $total,
    "total_pages" => ceil($total / $per_page),
    "data"        => $list
]);

$conn->close();
