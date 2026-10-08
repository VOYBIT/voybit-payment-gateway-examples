#!/bin/sh
set -eu

curl --silent --show-error --fail-with-body \
  --connect-timeout 5 \
  --max-time 20 \
  --request POST 'https://api.voybit.com/api/v1/gateway/checkout-sessions' \
  --header "X-Voybit-Api-Key: ${VOYBIT_API_KEY}" \
  --header 'Idempotency-Key: order:1001:attempt:1' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --data "$(cat <<EOF
{
  "fiat_amount": "25.00",
  "fiat_currency": "USD",
  "payment_window_seconds": 1800,
  "description": "Order 1001",
  "metadata": { "order_id": "1001" }
}
EOF
)"
