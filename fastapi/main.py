import os
import re

from fastapi import FastAPI, Request, Response
from voybit_payment_gateway import Client, parse_event, verify_webhook

app = FastAPI()


@app.post("/api/checkout")
async def checkout(request: Request):
    body = await request.json()
    order_id = str(body.get("order_id") or "")
    if re.fullmatch(r"[A-Za-z0-9._:-]{1,80}", order_id) is None:
        return Response(status_code=400)
    created = Client(os.environ["VOYBIT_API_KEY"]).create_checkout_session(
        {
            "fiat_amount": "25.00",
            "fiat_currency": "USD",
            "description": f"Order {order_id}",
            "metadata": {"order_id": order_id},
        },
        f"order:{order_id}:attempt:1",
    )
    return {"checkout_url": created["checkout_session"].get("checkout_url")}


@app.post("/webhooks/voybit")
async def webhook(request: Request):
    raw = await request.body()
    try:
        verify_webhook(
            os.environ["VOYBIT_WEBHOOK_SECRET"],
            request.headers.get("voybit-webhook-id", ""),
            request.headers.get("voybit-webhook-timestamp", ""),
            request.headers.get("voybit-webhook-signature", ""),
            raw,
        )
        event = parse_event(raw)
    except ValueError:
        return Response(status_code=401)
    if event.get("status") in ("paid", "overpaid"):
        # Fulfil this order once per Voybit-Webhook-Id.
        pass
    return Response(status_code=204)
