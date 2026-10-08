<?php

declare(strict_types=1);

$body = json_encode([
    'fiat_amount' => '25.00',
    'fiat_currency' => 'USD',
    'payment_window_seconds' => 1800,
    'description' => 'Order 1001',
    'metadata' => ['order_id' => '1001'],
], JSON_THROW_ON_ERROR);

$handle = curl_init('https://api.voybit.com/api/v1/gateway/checkout-sessions');
curl_setopt_array($handle, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => [
        'X-Voybit-Api-Key: ' . getenv('VOYBIT_API_KEY'),
        'Idempotency-Key: order:1001:attempt:1',
        'Content-Type: application/json',
        'Accept: application/json',
    ],
]);
$raw = curl_exec($handle);
$status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
curl_close($handle);
$session = json_decode((string) $raw, true);
if ($status >= 300 || !is_array($session)) {
    fwrite(STDERR, "HTTP {$status}\n");
    exit(1);
}
echo $session['session_id'], ' ', $session['status'], ' ', $session['checkout_url'], PHP_EOL;
