<?php
require "config.php";
$id = require_login();
$d = input();
$data = $d["data"] ?? null;
if (!is_array($data)) respond(["error" => "Invalid data"], 400);

unset($data["account"]["password"], $data["account"]["confirm"]);

$stmt = $pdo->prepare(
  "INSERT INTO profiles (user_id, data) VALUES (?, ?)
   ON DUPLICATE KEY UPDATE data = VALUES(data)"
);
$stmt->execute([$id, json_encode($data)]);
respond(["success" => true]);
