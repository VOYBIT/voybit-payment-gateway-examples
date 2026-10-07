const response = await fetch('https://api.voybit.com/api/v1/gateway/payments', {
  method: 'POST',
  headers: {
    'X-Voybit-Api-Key': process.env.VOYBIT_API_KEY,
    'Idempotency-Key': 'order:1001:attempt:1',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    asset_id: process.env.VOYBIT_ASSET_ID,
    crypto_amount: '25.0000',
    amount_minor: 2500,
    fiat_currency: 'USD',
    expires_in_seconds: 1800,
    description: 'Order #1001',
    metadata: { order_id: '1001' },
  }),
})

const payment = await response.json()
console.log(response.status, payment.checkout_url)
