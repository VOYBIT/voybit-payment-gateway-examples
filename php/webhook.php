<?php

declare(strict_types=1);

$raw = file_get_contents('php://input');
$id = $_SERVER['HTTP_VOYBIT_WEBHOOK_ID'] ?? '';
$timestamp = $_SERVER['HTTP_VOYBIT_WEBHOOK_TIMESTAMP'] ?? '';
$signature = $_SERVER['HTTP_VOYBIT_WEBHOOK_SIGNATURE'] ?? '';
$hex = str_starts_with($signature, 'v1=') ? substr($signature, 3) : '';
$supplied = preg_match('/^[0-9a-f]{64}$/i', $hex) ? hex2bin($hex) : false;
$seconds = ctype_digit($timestamp) ? (int) $timestamp : null;
$expected = hash_hmac('sha256', $id . '.' . $timestamp . '.' . $raw, (string) getenv('VOYBIT_WEBHOOK_SECRET'), true);
$fresh = $seconds !== null && abs(time() - $seconds) <= 300;
if ($supplied === false || !$fresh || !hash_equals($expected, $supplied)) {
    http_response_code(401);
    exit;
}
http_response_code(204);
