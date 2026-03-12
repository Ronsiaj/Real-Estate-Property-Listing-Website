<?php
header("Content-Type: application/json");

// ❗ For JWT, logout is usually handled client-side.
// Just instruct the client to delete its stored token.
echo json_encode([
    "success" => true,
    "msg" => "Logged out successfully. Please remove the token on the client."
]);
