#!/bin/sh
# Create one Voybit payment gateway invoice.
# Required: VOYBIT_API_KEY, VOYBIT_ASSET_ID

curl --request POST 'https://api.voybit.com/api/v1/gateway/payments' \
  --connect-timeout 5 \
  --max-time 20 \
  --header "X-Voybit-Api-Key: ${VOYBIT_API_KEY}" \
  --header 'Idempotency-Key: order:1001:attempt:1' \
  --header 'Content-Type: application/json' \
  --data "{
    \"asset_id\": \"${VOYBIT_ASSET_ID}\",
    \"crypto_amount\": \"25.0000\",
    \"amount_minor\": 2500,
    \"fiat_currency\": \"USD\",
    \"expires_in_seconds\": 1800,
    \"description\": \"Order #1001\",
    \"metadata\": { \"order_id\": \"1001\" }
  }"
