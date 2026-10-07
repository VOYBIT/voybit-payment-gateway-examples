#!/bin/sh
set -eu

curl --silent --show-error --fail-with-body \
  --connect-timeout 5 \
  --max-time 20 \
  --request POST 'https://api.voybit.com/api/v1/gateway/payments' \
  --header "X-Voybit-Api-Key: ${VOYBIT_API_KEY}" \
  --header 'Idempotency-Key: order:1001:attempt:1' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --data "$(cat <<EOF
{
  "asset_id": "${VOYBIT_ASSET_ID}",
  "crypto_amount": "25.0000",
  "amount_minor": 2500,
  "fiat_currency": "USD",
  "expires_in_seconds": 1800,
  "description": "Order 1001",
  "metadata": { "order_id": "1001" }
}
EOF
)"
