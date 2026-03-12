<?php
header("Content-Type: application/json");

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


require '../config/db.php';
require '../config/jwt.php';

// ✅ Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "msg" => "Method not allowed. Use DELETE."
    ]);
    exit;
}

// 🔒 Authenticate user
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "msg" => "Unauthorized"
    ]);
    exit;
}

// ✅ Get DELETE input (BODY + URL support)
parse_str(file_get_contents("php://input"), $data);

$property_id = $data['property_id']
    ?? $_GET['property_id']
    ?? null;

if (!$property_id) {
    echo json_encode([
        "success" => false,
        "msg" => "Missing property_id"
    ]);
    exit;
}

$property_id = intval($property_id);

// ✅ Fetch property
$stmt = $conn->prepare("SELECT * FROM properties WHERE property_id=?");
$stmt->bind_param("i", $property_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode([
        "success" => false,
        "msg" => "Property not found"
    ]);
    exit;
}

// 🔑 Ownership check
if ($user['role'] !== 'admin' && $row['user_id'] != $user['user_id']) {
    echo json_encode([
        "success" => false,
        "msg" => "Not allowed to delete this property"
    ]);
    exit;
}

// 🔁 Start transaction (safe delete)
$conn->begin_transaction();

try {

    // ✅ Delete property_files records
    $pf = $conn->prepare("DELETE FROM property_files WHERE property_id=?");
    $pf->bind_param("i", $property_id);
    $pf->execute();
    $pf->close();

    // ✅ Delete property row
    $delStmt = $conn->prepare("DELETE FROM properties WHERE property_id=?");
    $delStmt->bind_param("i", $property_id);
    $delStmt->execute();
    $delStmt->close();

    // ✅ Commit DB changes
    $conn->commit();

    // 🗑 Delete thumbnail
    if (!empty($row['property_thumbnail']) && file_exists($row['property_thumbnail'])) {
        @unlink($row['property_thumbnail']);
    }

    // 🗑 Delete gallery images
    $gallery = json_decode($row['gallery_imgs'], true) ?: [];
    foreach ($gallery as $f) {
        if ($f && file_exists($f)) {
            @unlink($f);
        }
    }

    // 🗑 Delete documents
    $docs = json_decode($row['property_documents'], true) ?: [];
    foreach ($docs as $f) {
        if ($f && file_exists($f)) {
            @unlink($f);
        }
    }

    echo json_encode([
        "success" => true,
        "msg" => "Property and all related data deleted successfully",
        "property_id" => $property_id
    ]);

} catch (Exception $e) {

    // ❌ Rollback on error
    $conn->rollback();

    echo json_encode([
        "success" => false,
        "msg" => "Delete failed",
        "error" => $e->getMessage()
    ]);
}

$conn->close();
?>
