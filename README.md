# Voybit payment gateway examples

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

`POST https://api.voybit.com/api/v1/gateway/payments` with `X-Voybit-Api-Key` and `Idempotency-Key`.

Required body fields: `asset_id`, `crypto_amount` (decimal string), `amount_minor`, `fiat_currency`. Optional: `gateway_id`, `expires_in_seconds` (300–86400), `description`, `metadata`.

Send the payer to `checkout_url`. Fulfil only when the webhook status is `paid` or `overpaid`. Verify `Voybit-Webhook-Signature` against the raw body before parsing, and ignore a repeated `Voybit-Webhook-Id`.
