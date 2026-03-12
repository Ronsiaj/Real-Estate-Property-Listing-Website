<?php
$host = "your_database_host";
$user =  "your_database_username";
$pass = "your_database_password";
$db   = "your_database_name";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "msg" => "Database connection failed: " . $conn->connect_error
    ]));
}
