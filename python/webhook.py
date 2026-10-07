import hashlib
import hmac
import json
import os
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        delivery_id = self.headers.get("Voybit-Webhook-Id", "")
        timestamp = self.headers.get("Voybit-Webhook-Timestamp", "")
        signature = self.headers.get("Voybit-Webhook-Signature", "")
        supplied = bytes.fromhex(signature.removeprefix("v1=")) if signature.startswith("v1=") else b""
        seconds = int(timestamp) if timestamp.isdigit() else 0
        signed = f"{delivery_id}.{timestamp}.".encode() + raw
        expected = hmac.new(os.environ["VOYBIT_WEBHOOK_SECRET"].encode(), signed, hashlib.sha256).digest()
        fresh = abs(int(time.time()) - seconds) <= 300
        valid = signature.startswith("v1=") and fresh and hmac.compare_digest(expected, supplied)
        if valid:
            json.loads(raw)
        self.send_response(204 if valid else 401)
        self.end_headers()


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8080), Handler).serve_forever()
