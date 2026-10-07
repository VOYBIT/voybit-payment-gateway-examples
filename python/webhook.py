import hashlib
import hmac
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
        hex_signature = signature[3:] if signature.startswith("v1=") else ""
        seconds = int(timestamp) if timestamp.isdigit() else None
        fresh = seconds is not None and abs(int(time.time()) - seconds) <= 300
        expected = hmac.new(
            os.environ["VOYBIT_WEBHOOK_SECRET"].encode(),
            f"{delivery_id}.{timestamp}.".encode() + raw,
            hashlib.sha256,
        ).digest()
        try:
            supplied = bytes.fromhex(hex_signature) if len(hex_signature) == 64 else b""
        except ValueError:
            supplied = b""
        valid = fresh and len(supplied) == len(expected) and hmac.compare_digest(expected, supplied)
        self.send_response(204 if valid else 401)
        self.end_headers()

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8080), Handler).serve_forever()
