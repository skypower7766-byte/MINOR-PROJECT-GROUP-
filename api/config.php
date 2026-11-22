<?php
session_start();
header("Content-Type: application/json");

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function input() {
    return json_decode(file_get_contents("php://input"), true) ?? [];
}

function require_login() {
    if (empty($_SESSION["user_id"])) respond(["error" => "Not logged in"], 401);
    return $_SESSION["user_id"];
}

try {
    $pdo = new PDO("mysql:host=localhost;dbname=skillswap;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    respond(["error" => "Database connection failed"], 500);
}
