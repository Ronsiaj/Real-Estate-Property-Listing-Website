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
require '../config/keys.php';
require '../vendor/autoload.php';

use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

// ✅ Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "msg" => "Method not allowed. Use POST."]);
    exit;
}

// 🔒 Authenticate user
$user = get_authenticated_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "msg" => "Unauthorized"]);
    exit;
}

// ✅ Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['razorpay_order_id'], $data['razorpay_payment_id'], $data['razorpay_signature'])) {
    echo json_encode(["success" => false, "msg" => "Missing payment data"]);
    exit;
}

$order_id   = $data['razorpay_order_id'];
$payment_id = $data['razorpay_payment_id'];
$signature  = $data['razorpay_signature'];

$api = new Api(RAZORPAY_KEY, RAZORPAY_SECRET);

try {
    // ✅ Verify payment signature
    $api->utility->verifyPaymentSignature([
        'razorpay_order_id'   => $order_id,
        'razorpay_payment_id' => $payment_id,
        'razorpay_signature'  => $signature
    ]);

    // ✅ Get subscription
    $subQ = $conn->prepare("SELECT sub_id, plan_id FROM subscriptions WHERE order_id=? AND user_id=? LIMIT 1");
    $subQ->bind_param("si", $order_id, $user['user_id']);
    $subQ->execute();
    $subRes = $subQ->get_result();
    if ($subRes->num_rows === 0) {
        echo json_encode(["success" => false, "msg" => "Subscription not found"]);
        $subQ->close();
        exit;
    }
    $sub = $subRes->fetch_assoc();
    $subQ->close();

    // ✅ Get plan duration
    $planStmt = $conn->prepare("SELECT duration_days FROM plans WHERE plan_id=?");
    $planStmt->bind_param("i", $sub['plan_id']);
    $planStmt->execute();
    $planRes = $planStmt->get_result()->fetch_assoc();
    $planStmt->close();

    // ✅ Update subscription
    $stmt = $conn->prepare(
        "UPDATE subscriptions 
         SET payment_id=?, payment_status='success', start_date=CURDATE(), end_date=DATE_ADD(CURDATE(), INTERVAL ? DAY), status='active' 
         WHERE sub_id=?"
    );
    $stmt->bind_param("sii", $payment_id, $planRes['duration_days'], $sub['sub_id']);
    $stmt->execute();
    $stmt->close();

    echo json_encode(["success" => true, "msg" => "Payment verified, subscription active"]);

} catch (SignatureVerificationError $e) {
    echo json_encode(["success" => false, "msg" => "Payment verification failed"]);
}

$conn->close();
