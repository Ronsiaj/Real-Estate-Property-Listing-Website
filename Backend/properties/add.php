<?php
header("Content-Type: application/json");
require '../config/db.php';
require '../config/jwt.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success"=>false,"msg"=>"Use POST"]);
    exit;
}

$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success"=>false,"msg"=>"Unauthorized"]);
    exit;
}

function clean($d){ return strtolower(trim($d)); }

function check_required($fields,$src){
    foreach($fields as $f){
        if(!isset($src[$f]) || $src[$f]===''){
            echo json_encode(["success"=>false,"msg"=>"Missing $f"]);
            exit;
        }
    }
}

# ===============================
# FILE UPLOAD
# ===============================
function uploadFile($file,$serverFolder,$dbFolder,$types,$maxMB){

    if(empty($file['name']) || $file['error']!=0) return null;

    if(!is_dir($serverFolder)) mkdir($serverFolder,0777,true);

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if(!in_array($ext,$types)){
        echo json_encode(["success"=>false,"msg"=>"Invalid file type $ext"]);
        exit;
    }

    if($file['size'] > $maxMB*1024*1024){
        echo json_encode(["success"=>false,"msg"=>"Each file max {$maxMB}MB only"]);
        exit;
    }

    
    $name = uniqid() . "_" . basename($file['name']);
    $serverPath = $serverFolder . "/" . $name;

    if(move_uploaded_file($file['tmp_name'], $serverPath)){
        return $dbFolder . "/" . $name;
    }

    return null;
}

# ===============================
# INIT
# ===============================
$serverUploadPath = __DIR__ . "/../uploads/properties";
$dbUploadPath = "uploads/properties";

$user_id = $user['user_id'];

$category_id = intval($_POST['category_id'] ?? 0);
$type_id     = intval($_POST['type_id'] ?? 0);

# ===============================
# VALIDATE CATEGORY EXISTS
# ===============================
$checkCat = $conn->prepare("SELECT category_id FROM property_categories WHERE category_id=?");
$checkCat->bind_param("i",$category_id);
$checkCat->execute();
$resCat = $checkCat->get_result();

if($resCat->num_rows === 0){
    echo json_encode(["success"=>false,"msg"=>"Invalid category"]);
    exit;
}

# ===============================
# CATEGORY GROUPS (MATCH FRONTEND)
# ===============================
$residential = [1,5,6,7];   // beds required
$landplot    = [2,3];       // acres required
$commercial  = [4];         // no beds, no acres

# ===============================
# COMMON REQUIRED
# ===============================
check_required([
    "property_name",
    "property_address",
    "description",
    "latitude",
    "longitude",
    "sqft",
    "price"
], $_POST);

$property_name   = clean($_POST['property_name']);
$property_address= clean($_POST['property_address']);
$description     = clean($_POST['description']);

# ===============================
# CATEGORY-SPECIFIC VALIDATION
# ===============================
$beds = $baths = $parking = $year_built = null;
$acres = $ownership_details = null;

if(in_array($category_id,$residential)){
    check_required(["beds","baths","parking","year_built"], $_POST);

    $beds        = $_POST['beds'];
    $baths       = $_POST['baths'];
    $parking     = $_POST['parking'];
    $year_built  = $_POST['year_built'];
}

if(in_array($category_id,$landplot)){
    check_required(["acres","ownership_details"], $_POST);

    $acres = $_POST['acres'];
    $ownership_details = clean($_POST['ownership_details']);
}

# ===============================
# FILES
# ===============================
$thumbnail = uploadFile(
    $_FILES['property_thumbnail'] ?? [],
    $serverUploadPath,
    $dbUploadPath,
    ["jpg","jpeg","png"],
    5
);

$gallery=[];
if(isset($_FILES['gallery_img']) && !empty($_FILES['gallery_img']['name'][0])){
    foreach($_FILES['gallery_img']['name'] as $i=>$n){
        $file=[
            'name'=>$_FILES['gallery_img']['name'][$i],
            'type'=>$_FILES['gallery_img']['type'][$i],
            'tmp_name'=>$_FILES['gallery_img']['tmp_name'][$i],
            'error'=>$_FILES['gallery_img']['error'][$i],
            'size'=>$_FILES['gallery_img']['size'][$i]
        ];
        $up=uploadFile($file,$serverUploadPath,$dbUploadPath,["jpg","jpeg","png"],5);
        if($up) $gallery[]=$up;
    }
}

$gallery_json = !empty($gallery) ? json_encode($gallery) : null;



# ===============================
# DOCUMENTS
# ===============================
$documents = [];

if(isset($_FILES['property_documents']) && !empty($_FILES['property_documents']['name'][0])){
    foreach($_FILES['property_documents']['name'] as $i=>$n){
        $file=[
            'name'=>$_FILES['property_documents']['name'][$i],
            'type'=>$_FILES['property_documents']['type'][$i],
            'tmp_name'=>$_FILES['property_documents']['tmp_name'][$i],
            'error'=>$_FILES['property_documents']['error'][$i],
            'size'=>$_FILES['property_documents']['size'][$i]
        ];

        $up=uploadFile(
            $file,
            $serverUploadPath,
            $dbUploadPath,
            ["pdf","doc","docx"],
            10
        );

        if($up) $documents[]=$up;
    }
}

$documents_json = !empty($documents) ? json_encode($documents) : null;




# ===============================
# INSERT
# ===============================
$sql="INSERT INTO properties
(user_id,category_id,type_id,property_name,property_address,description,
latitude,longitude,beds,baths,sqft,parking,year_built,price,
acres,ownership_details,property_thumbnail,gallery_imgs,property_documents)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

$stmt=$conn->prepare($sql);
$stmt->bind_param(
    "iiisssddiiiiiddssss",
    $user_id,$category_id,$type_id,$property_name,$property_address,$description,
    $_POST['latitude'],$_POST['longitude'],
    $beds,$baths,$_POST['sqft'],$parking,$year_built,$_POST['price'],
    $acres,$ownership_details,$thumbnail,$gallery_json,$documents_json
);

if($stmt->execute()){
    echo json_encode([
        "success"=>true,
        "msg"=>"Property added",
        "property_id"=>$stmt->insert_id
    ]);
}else{
    echo json_encode(["success"=>false,"msg"=>$stmt->error]);
}

$stmt->close();
$conn->close();