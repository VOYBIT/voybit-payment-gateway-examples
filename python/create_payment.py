import json
import os
import urllib.request

body = json.dumps({
    "fiat_amount": "25.00",
    "fiat_currency": "USD",
    "payment_window_seconds": 1800,
    "description": "Order 1001",
    "metadata": {"order_id": "1001"},
}).encode()

request = urllib.request.Request(
    "https://api.voybit.com/api/v1/gateway/checkout-sessions",
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
    session = json.load(response)
print(session["session_id"], session["status"], session["checkout_url"])
