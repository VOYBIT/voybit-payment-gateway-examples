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
		raw, _ := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
		id := r.Header.Get("Voybit-Webhook-Id")
		timestamp := r.Header.Get("Voybit-Webhook-Timestamp")
		signature := r.Header.Get("Voybit-Webhook-Signature")
		seconds, err := strconv.ParseInt(timestamp, 10, 64)
		supplied, hexErr := hex.DecodeString(strings.TrimPrefix(signature, "v1="))
		if err != nil || hexErr != nil || !strings.HasPrefix(signature, "v1=") || len(supplied) != sha256.Size || abs(time.Now().Unix()-seconds) > 300 {
			http.Error(w, "invalid signature", http.StatusUnauthorized)
			return
		}
		mac := hmac.New(sha256.New, []byte(os.Getenv("VOYBIT_WEBHOOK_SECRET")))
		mac.Write([]byte(id + "." + timestamp + "."))
		mac.Write(raw)
		if !hmac.Equal(mac.Sum(nil), supplied) {
			http.Error(w, "invalid signature", http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
	_ = http.ListenAndServe(":8080", nil)
}

func abs(value int64) int64 {
	if value < 0 {
		return -value
	}
	return value
}
