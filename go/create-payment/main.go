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
	body, err := json.Marshal(map[string]any{
		"asset_id":           os.Getenv("VOYBIT_ASSET_ID"),
		"crypto_amount":      "25.0000",
		"amount_minor":       2500,
		"fiat_currency":      "USD",
		"expires_in_seconds": 1800,
		"description":        "Order 1001",
		"metadata":           map[string]string{"order_id": "1001"},
	})
	if err != nil {
		exit(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.voybit.com/api/v1/gateway/payments", bytes.NewReader(body))
	if err != nil {
		exit(err)
	}
	request.Header.Set("X-Voybit-Api-Key", os.Getenv("VOYBIT_API_KEY"))
	request.Header.Set("Idempotency-Key", "order:1001:attempt:1")
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Accept", "application/json")
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		exit(err)
	}
	defer response.Body.Close()
	raw, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		exit(err)
	}
	if response.StatusCode >= 300 {
		fmt.Fprintf(os.Stderr, "HTTP %d\n%s\n", response.StatusCode, raw)
		os.Exit(1)
	}
	var payment struct {
		ID          string `json:"id"`
		Status      string `json:"status"`
		CheckoutURL string `json:"checkout_url"`
	}
	if err := json.Unmarshal(raw, &payment); err != nil {
		exit(err)
	}
	fmt.Println(payment.ID, payment.Status, payment.CheckoutURL)
}

func exit(err error) {
	fmt.Fprintln(os.Stderr, err)
	os.Exit(1)
}
