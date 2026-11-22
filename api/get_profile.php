<?php
require "config.php";
$id = require_login();
$stmt = $pdo->prepare("SELECT data FROM profiles WHERE user_id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();
respond($row ? json_decode($row["data"], true) : null);
