<?php
require "config.php";

$d = input();
$name     = trim($d["name"] ?? "");
$username = trim($d["username"] ?? "");
$password = $d["password"] ?? "";
$mobile   = trim($d["mobile"] ?? "");
$email    = trim($d["email"] ?? "");
$location = trim($d["location"] ?? "");
$otp      = trim($d["otp"] ?? "");

if (!$name || !$username || !$password || !$mobile || !$email)
    respond(["error" => "Please fill in all required fields."], 400);
if (!filter_var($email, FILTER_VALIDATE_EMAIL))
    respond(["error" => "Invalid email."], 400);
if (strlen($password) < 8)
    respond(["error" => "Password must be at least 8 characters."], 400);

if (empty($_SESSION["otp_hash"]) || $_SESSION["otp_email"] !== $email)
    respond(["error" => "Please request an OTP first."], 400);
if (time() > $_SESSION["otp_expiry"])
    respond(["error" => "OTP has expired. Please request a new one."], 400);
if (!password_verify($otp, $_SESSION["otp_hash"]))
    respond(["error" => "Invalid OTP."], 400);

$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->execute([$username, $email]);
if ($stmt->fetch()) respond(["error" => "User already exists. Please log in."], 409);

$stmt = $pdo->prepare(
  "INSERT INTO users (name, username, email, mobile, location, password_hash)
   VALUES (?, ?, ?, ?, ?, ?)"
);
$stmt->execute([$name, $username, $email, $mobile, $location,
                password_hash($password, PASSWORD_DEFAULT)]);

unset($_SESSION["otp_hash"], $_SESSION["otp_email"], $_SESSION["otp_expiry"]);
respond(["success" => true]);
