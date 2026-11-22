<?php
require "config.php";
session_destroy();
respond(["success" => true]);
