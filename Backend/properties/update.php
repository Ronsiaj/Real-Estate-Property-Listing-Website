<?php
header("Content-Type: application/json");

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';

/* ==========================
   METHOD CHECK
========================== */
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
    http_response_code(405);
    echo json_encode(["success"=>false,"msg"=>"Method not allowed. Use POST or PUT"]);
    exit;
}

/* ==========================
   AUTH
========================== */
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success"=>false,"msg"=>"Unauthorized"]);
    exit;
}

/* ==========================
   JSON BODY SUPPORT
========================== */
if (
    isset($_SERVER['CONTENT_TYPE']) &&
    strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false
) {
    $json = json_decode(file_get_contents("php://input"), true);
    if (is_array($json)) {
        foreach ($json as $k => $v) {
            $_POST[$k] = $v;
        }
    }
}

/* ==========================
   HELPERS
========================== */
function clean($v){
    return strtolower(trim($v));
}

function normalizeFilesArray($files){
    $out = [];
    if (!isset($files['name'])) return $out;

    if (is_array($files['name'])) {
        foreach ($files['name'] as $i => $n) {
            $out[] = [
                'name'     => $files['name'][$i],
                'type'     => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error'    => $files['error'][$i],
                'size'     => $files['size'][$i]
            ];
        }
    } else {
        $out[] = $files;
    }
    return $out;
}

function uploadFile($file, $folder, $allowed, $maxMB){
    if (!isset($file['name']) || $file['error'] !== 0) return null;

    // 🔥 FIX: ensure folder exists
    if (!is_dir($folder)) {
        mkdir($folder, 0777, true);
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        echo json_encode(["success"=>false,"msg"=>"Invalid file type: $ext"]);
        exit;
    }

    if ($file['size'] > $maxMB * 1024 * 1024) {
        echo json_encode(["success"=>false,"msg"=>"File size exceeds {$maxMB}MB"]);
        exit;
    }

    $safeName = preg_replace('/\s+/', '_', strtolower(basename($file['name'])));
    $name = time() . "_" . $safeName;
    $path = $folder . "/" . $name;

    if (move_uploaded_file($file['tmp_name'], $path)) {
        return $path;
    }

    return null;
}

/* ==========================
   PROPERTY ID
========================== */
if (!isset($_POST['property_id'])) {
    echo json_encode(["success"=>false,"msg"=>"Missing property_id"]);
    exit;
}
$property_id = intval($_POST['property_id']);

/* ==========================
   FETCH PROPERTY
========================== */
$q = $conn->prepare("SELECT * FROM properties WHERE property_id=?");
$q->bind_param("i", $property_id);
$q->execute();
$old = $q->get_result()->fetch_assoc();
$q->close();

if (!$old) {
    echo json_encode(["success"=>false,"msg"=>"Property not found"]);
    exit;
}

/* ==========================
   OWNERSHIP CHECK
========================== */
if ($user['role'] !== 'admin' && $old['user_id'] != $user['user_id']) {
    echo json_encode(["success"=>false,"msg"=>"Not allowed to update"]);
    exit;
}

/* ==========================
   BUILD UPDATE FIELDS
   (ANY FIELD – OPTIONAL)
========================== */
$allowed_fields = [
    "category_id","type_id","property_name","property_address","description",
    "latitude","longitude","beds","baths","sqft","parking","year_built",
    "price","ownership_details","amenities","acres"
];

$updates = [];
$types   = "";
$vals    = [];

foreach ($allowed_fields as $f) {
    if (array_key_exists($f, $_POST)) {

        $val = $_POST[$f];

        if (in_array($f, ["property_name","property_address","description","ownership_details"])) {
            $val = clean($val);
        }

        if ($f === "amenities" && is_array($val)) {
            $val = json_encode($val);
        }

        $updates[] = "$f=?";
        if (in_array($f, ['category_id','type_id','beds','baths','parking','year_built'])) {
            $types .= "i"; $vals[] = intval($val);
        } elseif (in_array($f, ['latitude','longitude','sqft','acres','price'])) {
            $types .= "d"; $vals[] = floatval($val);
        } else {
            $types .= "s"; $vals[] = $val;
        }
    }
}

/* ==========================
   FILE UPLOADS → property_files
========================== */
$baseFolder = __DIR__ . "/../uploads/properties";

// Thumbnail
if (isset($_FILES['property_thumbnail'])) {
    $p = uploadFile($_FILES['property_thumbnail'], $baseFolder, ["jpg","jpeg","png"], 5);
    if ($p) {
        $rel = "uploads/properties/" . basename($p);
        $ins = $conn->prepare(
            "INSERT INTO property_files (property_id,file_path,file_type) VALUES (?,?,?)"
        );
        $t = "thumbnail";
        $ins->bind_param("iss", $property_id, $rel, $t);
        $ins->execute();
        $ins->close();
    }
}

// Gallery
if (isset($_FILES['gallery_imgs'])) {
    foreach (normalizeFilesArray($_FILES['gallery_imgs']) as $f) {
        $p = uploadFile($f, $baseFolder, ["jpg","jpeg","png"], 10);
        if ($p) {
            $rel = "uploads/properties/" . basename($p);
            $ins = $conn->prepare(
                "INSERT INTO property_files (property_id,file_path,file_type) VALUES (?,?,?)"
            );
            $t = "gallery";
            $ins->bind_param("iss", $property_id, $rel, $t);
            $ins->execute();
            $ins->close();
        }
    }
}

// Documents
if (isset($_FILES['property_documents'])) {
    foreach (normalizeFilesArray($_FILES['property_documents']) as $f) {
        $p = uploadFile($f, $baseFolder, ["jpg","jpeg","png","pdf","doc","docx"], 5);
        if ($p) {
            $rel = "uploads/properties/" . basename($p);
            $ins = $conn->prepare(
                "INSERT INTO property_files (property_id,file_path,file_type) VALUES (?,?,?)"
            );
            $t = "document";
            $ins->bind_param("iss", $property_id, $rel, $t);
            $ins->execute();
            $ins->close();
        }
    }
}

/* ==========================
   UPDATE PROPERTIES
========================== */
if (!empty($updates)) {
    $sql = "UPDATE properties SET " . implode(",", $updates) . " WHERE property_id=?";
    $types .= "i";
    $vals[] = $property_id;

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$vals);
    $stmt->execute();
    $stmt->close();
}

$conn->close();

/* ==========================
   RESPONSE
========================== */
echo json_encode([
    "success" => true,
    "msg"     => "Property updated successfully",
    "property_id" => $property_id
]);
