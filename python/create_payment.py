import json
import os
import urllib.request

body = json.dumps({
    "asset_id": os.environ["VOYBIT_ASSET_ID"],
    "crypto_amount": "25.0000",
    "amount_minor": 2500,
    "fiat_currency": "USD",
    "expires_in_seconds": 1800,
    "description": "Order 1001",
    "metadata": {"order_id": "1001"},
}).encode()

request = urllib.request.Request(
    "https://api.voybit.com/api/v1/gateway/payments",
    data=body,
    method="POST",
    headers={
        "X-Voybit-Api-Key": os.environ["VOYBIT_API_KEY"],
        "Idempotency-Key": "order:1001:attempt:1",
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
)
with urllib.request.urlopen(request, timeout=20) as response:
    payment = json.load(response)
print(payment["id"], payment["status"], payment["checkout_url"])
