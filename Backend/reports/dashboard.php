<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/jwt.php';

/* ================= AUTH ================= */

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status"=>"error","message"=>"GET only"]);
    exit;
}

$user = get_authenticated_user();
if (!$user || ($user['role'] ?? null) !== 'admin') {
    http_response_code(403);
    echo json_encode(["status"=>"error","message"=>"Admin only"]);
    exit;
}

/* ================= HELPER ================= */

function single($conn, $sql){
    return $conn->query($sql)->fetch_assoc();
}
$range = $_GET['range'] ?? 'thismonth';

/* ================= RANGE MAP (ADD HERE) ================= */

$map = [
    "today" => "today",
    "yesterday" => "yesterday",
    "week" => "last3days",
    "month" => "thismonth",
    "3months" => "last3months",
    "12months" => "lastyear"
];

$rangeKey = $map[$range] ?? "thismonth";
/* ================= DATE RANGE BUILDER ================= */

function rangeDates($type){

    switch($type){

        case 'today':
            return [date('Y-m-d 00:00:00'), date('Y-m-d 23:59:59')];

        case 'yesterday':
            return [
                date('Y-m-d 00:00:00', strtotime('-1 day')),
                date('Y-m-d 23:59:59', strtotime('-1 day'))
            ];

        case 'last3days':
            return [
                date('Y-m-d 00:00:00', strtotime('-3 days')),
                date('Y-m-d 23:59:59')
            ];

        case 'thismonth':
            return [
                date('Y-m-01 00:00:00'),
                date('Y-m-d 23:59:59')
            ];

        case 'lastmonth':
            return [
                date('Y-m-01 00:00:00', strtotime('first day of last month')),
                date('Y-m-t 23:59:59', strtotime('last day of last month'))
            ];

        case 'last3months':
            return [
                date('Y-m-01 00:00:00', strtotime('-3 months')),
                date('Y-m-d 23:59:59')
            ];

        case 'lastyear':
            return [
                date('Y-01-01 00:00:00', strtotime('-1 year')),
                date('Y-12-31 23:59:59', strtotime('-1 year'))
            ];
    }
}

/* ================= SUMMARY FUNCTION ================= */

function getSummary($conn, $start, $end){

    return [

        (int) single($conn,"SELECT COUNT(*) t FROM enquiries WHERE created_at BETWEEN '$start' AND '$end'")['t'],

        (int) single($conn,"SELECT COUNT(*) t FROM properties WHERE created_at BETWEEN '$start' AND '$end'")['t'],

        (int) single($conn,"SELECT COUNT(*) t FROM users WHERE created_at BETWEEN '$start' AND '$end'")['t'],

        (int) single($conn,"SELECT COUNT(*) t FROM users WHERE last_login BETWEEN '$start' AND '$end'")['t'],

        (float) single($conn,"SELECT COALESCE(SUM(amount),0) t FROM subscriptions WHERE start_date BETWEEN '$start' AND '$end'")['t']
    ];
}

/* ================= BUILD ALL SUMMARY CHART DATA ================= */

$periods = [
    "today"=>"Today",
    "yesterday"=>"Yesterday",
    "last3days"=>"Last 3 Days",
    "thismonth"=>"This Month",
    "lastmonth"=>"Last Month",
    "last3months"=>"Last 3 Months",
    "lastyear"=>"Last Year"
];

list($s,$e) = rangeDates($rangeKey);
$summaryData = getSummary($conn,$s,$e);

/* ================= FILTER FOR ENQUIRY TREND ================= */

$filterStart = null;
$filterEnd = null;

if(isset($_GET['today'])){
    list($filterStart,$filterEnd)=rangeDates('today');
}
elseif(isset($_GET['from_date']) && isset($_GET['to_date'])){
    $filterStart = $_GET['from_date']." 00:00:00";
    $filterEnd   = $_GET['to_date']." 23:59:59";
}

/* ================= ENQUIRY TREND CHART ================= */

if($filterStart){

    $res = $conn->query("
        SELECT DATE(created_at) d, COUNT(*) c
        FROM enquiries
        WHERE created_at BETWEEN '$filterStart' AND '$filterEnd'
        GROUP BY d ORDER BY d
    ");

}else{

    $res = $conn->query("
        SELECT DATE(created_at) d, COUNT(*) c
        FROM enquiries
        GROUP BY d ORDER BY d LIMIT 30
    ");
}

$labels=[]; $data=[];
while($r=$res->fetch_assoc()){
    $labels[]=$r['d'];
    $data[]=(int)$r['c'];
}

$enquiriesChart=[
    "labels"=>$labels,
    "datasets"=>[
        [
            "label"=>"Enquiries",
            "data"=>$data
        ]
    ]
];

/* ================= FINAL ================= */

echo json_encode([
    "success" => true,
    "data" => [
        "summary" => [
        "revenue" => $summaryData[4] ?? 0,
        "total_enquiries" => $summaryData[0] ?? 0,
        "active_users" => $summaryData[3] ?? 0,
        "total_properties" => $summaryData[1] ?? 0
],
        "charts" => [
            "enquiries" => $enquiriesChart,
            "properties" => [
                "labels" => [],
                "datasets" => [["data" => []]]
            ]
        ],
        "top_performing_property" => null,
        "most_popular_plan" => null,
        "notifications" => []
    ]
]);