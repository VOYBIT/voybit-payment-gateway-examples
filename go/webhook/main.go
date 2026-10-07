package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

func main() {
	http.HandleFunc("/webhooks/voybit", func(w http.ResponseWriter, r *http.Request) {
		raw, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
		if err != nil || !valid(os.Getenv("VOYBIT_WEBHOOK_SECRET"), r.Header.Get("Voybit-Webhook-Id"), r.Header.Get("Voybit-Webhook-Timestamp"), r.Header.Get("Voybit-Webhook-Signature"), raw) {
			http.Error(w, "invalid signature", http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}

func valid(secret, id, timestamp, signature string, raw []byte) bool {
	hexSignature := strings.TrimPrefix(signature, "v1=")
	seconds, err := strconv.ParseInt(timestamp, 10, 64)
	supplied, hexErr := hex.DecodeString(hexSignature)
	if secret == "" || id == "" || err != nil || hexErr != nil || !strings.HasPrefix(signature, "v1=") || len(hexSignature) != sha256.Size*2 || len(supplied) != sha256.Size {
		return false
	}
	if age := time.Now().Unix() - seconds; age > 300 || age < -300 {
		return false
	}
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(id + "." + timestamp + "."))
	_, _ = mac.Write(raw)
	return hmac.Equal(mac.Sum(nil), supplied)
}
