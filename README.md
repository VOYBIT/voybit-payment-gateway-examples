# Voybit payment gateway examples

## Get an API key

1. Create an account at [dashboard.voybit.com](https://dashboard.voybit.com).
2. Open **Gateways**, create a payment gateway, and enable every asset and network customers may choose. Store the webhook secret (`whsec_…`) as `VOYBIT_WEBHOOK_SECRET`.
3. Open **API keys**, choose **Create secret key**, and bind it to that gateway. Copy the full `vb_live_…` value once and store it as `VOYBIT_API_KEY` on your server.

Browser and mobile samples never receive that key. They only open `checkout_url`.

Standalone samples. The API key and webhook secret stay on your server. Browser and mobile samples only open `checkout_url`.

Libraries:

- [Go](https://github.com/VOYBIT/voybit-payment-gateway-go)
- [Node.js](https://github.com/VOYBIT/voybit-payment-gateway-node) (TypeScript declarations included)
- [Python](https://github.com/VOYBIT/voybit-payment-gateway-python)
- [PHP](https://github.com/VOYBIT/voybit-payment-gateway-php)
- [.NET](https://github.com/VOYBIT/voybit-payment-gateway-dotnet)
- [Java](https://github.com/VOYBIT/voybit-payment-gateway-java)
- [Ruby](https://github.com/VOYBIT/voybit-payment-gateway-ruby)
- [Android](https://github.com/VOYBIT/voybit-payment-gateway-android)
- [Swift](https://github.com/VOYBIT/voybit-payment-gateway-swift)
- [Flutter](https://github.com/VOYBIT/voybit-payment-gateway-flutter)
- [React Native](https://github.com/VOYBIT/voybit-payment-gateway-react-native)
- [React](https://github.com/VOYBIT/voybit-payment-gateway-react)
- [Laravel](https://github.com/VOYBIT/voybit-payment-gateway-laravel)
- [Django](https://github.com/VOYBIT/voybit-payment-gateway-django)

`next/`, `nuxt/`, and `fastapi/` call the Node.js or Python library from server routes. `vue/` only sends the payer to `checkout_url`.

`POST https://api.voybit.com/api/v1/gateway/checkout-sessions` with `X-Voybit-Api-Key` and `Idempotency-Key`.

Required body fields: `fiat_amount` (positive decimal string) and `fiat_currency` (`USD`, `EUR`, or `GBP`). Optional: `payment_window_seconds` (300–86400), `description`, and `metadata`.

Send the payer to `checkout_url`. Voybit shows only the assets enabled on that gateway, quotes the payer’s selection, and creates the address and QR after confirmation. Fulfil only when the webhook status is `paid` or `overpaid`. Verify `Voybit-Webhook-Signature` against the raw body before parsing, and ignore a repeated `Voybit-Webhook-Id`.
