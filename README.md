# Voybit payment gateway examples

Copy-paste samples for the [Voybit payment gateway](https://voybit.com/developer-tools). Each folder is one language. The maintained libraries are separate:

- [Go](https://github.com/VOYBIT/voybit-payment-gateway-go)
- [Node.js](https://github.com/VOYBIT/voybit-payment-gateway-node)
- [Python](https://github.com/VOYBIT/voybit-payment-gateway-python)
- [PHP](https://github.com/VOYBIT/voybit-payment-gateway-php)

The API key and webhook secret stay on your server. The Vue sample only redirects the browser to `checkout_url`.

`POST https://api.voybit.com/api/v1/gateway/payments`

| Field | Meaning |
| --- | --- |
| `asset_id` | Asset enabled on the gateway. |
| `crypto_amount` | Exact crypto amount as a decimal string. |
| `amount_minor` | Fiat amount in minor units. |
| `fiat_currency` | Three-letter code, such as `USD`. |
| `expires_in_seconds` | Optional, from 300 to 86400. |
| `description` | Optional checkout text. |
| `metadata` | Optional object for your own order id. |

Send `X-Voybit-Api-Key` and `Idempotency-Key`. Send the customer to `checkout_url`. Fulfil the order only when the webhook status is `paid` or `overpaid`.
