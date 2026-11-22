<?php
require "config.php";
$id = require_login();
$stmt = $pdo->prepare("SELECT id, name, username, email, mobile, location FROM users WHERE id = ?");
$stmt->execute([$id]);
respond($stmt->fetch());
