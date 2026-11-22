<?php
require "config.php";

$d = input();
$email = trim($d["email"] ?? "");
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(["error" => "Valid email required"], 400);

$otp = (string) random_int(100000, 999999);
$_SESSION["otp_hash"]   = password_hash($otp, PASSWORD_DEFAULT);
$_SESSION["otp_email"]  = $email;
$_SESSION["otp_expiry"] = time() + 60;

// DEV MODE: OTP seedha bhej rahe hain. Live site par "dev_otp" hata kar
// PHPMailer se email bhejna hai.
respond(["success" => true, "dev_otp" => $otp]);
