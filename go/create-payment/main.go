package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

func main() {
	body, _ := json.Marshal(map[string]any{
		"asset_id":           os.Getenv("VOYBIT_ASSET_ID"),
		"crypto_amount":      "25.0000",
		"amount_minor":       2500,
		"fiat_currency":      "USD",
		"expires_in_seconds": 1800,
		"description":        "Order #1001",
		"metadata":           map[string]string{"order_id": "1001"},
	})
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.voybit.com/api/v1/gateway/payments", bytes.NewReader(body))
	if err != nil {
		panic(err)
	}
	request.Header.Set("X-Voybit-Api-Key", os.Getenv("VOYBIT_API_KEY"))
	request.Header.Set("Idempotency-Key", "order:1001:attempt:1")
	request.Header.Set("Content-Type", "application/json")
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		panic(err)
	}
	defer response.Body.Close()
	raw, _ := io.ReadAll(response.Body)
	fmt.Println(response.StatusCode, string(raw))
}
