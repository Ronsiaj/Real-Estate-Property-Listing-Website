<?php
header("Content-Type: application/json");
require '../config/db.php';
require '../config/jwt.php';
require '../config/keys.php';
require '../vendor/autoload.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


use Razorpay\Api\Api;

// 🛡 Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "msg"     => "Method Not Allowed. Use POST."
    ]);
    exit;
}

// 🔑 Authenticate user
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success"=>false,"msg"=>"Unauthorized"]);
    exit;
}

// 🔹 Support JSON body
if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $_POST[$key] = $value;
        }
    }
}

// 🔹 Validate input
if (!isset($_POST['plan_id']) || empty($_POST['plan_id'])) {
    http_response_code(400);
    echo json_encode(["success"=>false,"msg"=>"Missing plan_id"]);
    exit;
}

$plan_id = intval($_POST['plan_id']);

// 🗄 Fetch plan details
$plan = $conn->prepare("SELECT price, duration_days FROM plans WHERE plan_id=? LIMIT 1");
$plan->bind_param("i", $plan_id);
$plan->execute();
$res = $plan->get_result();
if ($res->num_rows === 0) {
    echo json_encode(["success"=>false,"msg"=>"Invalid plan"]);
    exit;
}
$planData = $res->fetch_assoc();
$plan->close();

// 🏦 Razorpay order create
try {
    $api = new Api(RAZORPAY_KEY, RAZORPAY_SECRET);
    $orderData = [
        'receipt'         => 'order_rcptid_'.time(),
        'amount'          => $planData['price'] * 100, // paise
        'currency'        => 'INR',
        'payment_capture' => 1
    ];
    $order = $api->order->create($orderData);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success"=>false,"msg"=>"Razorpay order creation failed","error"=>$e->getMessage()]);
    exit;
}

// 🗓 Calculate start & end date
$start_date = date('Y-m-d');
$end_date   = date('Y-m-d', strtotime("+{$planData['duration_days']} days"));

// 🗄 Insert subscription as pending
$stmt = $conn->prepare("INSERT INTO subscriptions 
    (user_id, plan_id, start_date, end_date, status, amount, order_id, payment_status) 
    VALUES (?, ?, ?, ?, 'active', ?, ?, 'pending')");
$stmt->bind_param(
    "isssds",
    $user['user_id'],
    $plan_id,
    $start_date,
    $end_date,
    $planData['price'],
    $order['id']
);
$stmt->execute();
$sub_id = $stmt->insert_id;
$stmt->close();

// ✅ Response
echo json_encode([
    "success"  => true,
    "order_id" => $order['id'],
    "amount"   => $planData['price'],
    "currency" => "INR",
    "sub_id"   => $sub_id,
    "start"    => $start_date,
    "end"      => $end_date
]);
