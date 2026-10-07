<?php

declare(strict_types=1);

$raw = file_get_contents('php://input');
$id = $_SERVER['HTTP_VOYBIT_WEBHOOK_ID'] ?? '';
$timestamp = $_SERVER['HTTP_VOYBIT_WEBHOOK_TIMESTAMP'] ?? '';
$signature = $_SERVER['HTTP_VOYBIT_WEBHOOK_SIGNATURE'] ?? '';
$supplied = hex2bin(substr($signature, 3));
$seconds = ctype_digit($timestamp) ? (int) $timestamp : 0;
$expected = hash_hmac('sha256', $id . '.' . $timestamp . '.' . $raw, getenv('VOYBIT_WEBHOOK_SECRET'), true);
$fresh = abs(time() - $seconds) <= 300;
if (!str_starts_with($signature, 'v1=') || $supplied === false || !$fresh || !hash_equals($expected, $supplied)) {
    http_response_code(401);
    exit;
}
http_response_code(204);
