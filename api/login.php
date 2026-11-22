<?php
require "config.php";

$d = input();
$username = trim($d["username"] ?? "");
$password = $d["password"] ?? "";

$stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user["password_hash"]))
    respond(["error" => "Invalid username or password."], 401);

session_regenerate_id(true);
$_SESSION["user_id"] = $user["id"];
respond(["success" => true]);
