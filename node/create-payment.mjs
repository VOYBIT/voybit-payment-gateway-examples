const response = await fetch('https://api.voybit.com/api/v1/gateway/checkout-sessions', {
  method: 'POST',
  redirect: 'error',
  headers: {
    'X-Voybit-Api-Key': process.env.VOYBIT_API_KEY,
    'Idempotency-Key': 'order:1001:attempt:1',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({
    fiat_amount: '25.00',
    fiat_currency: 'USD',
    payment_window_seconds: 1800,
    description: 'Order 1001',
    metadata: { order_id: '1001' },
  }),
})

const session = await response.json()
if (!response.ok) {
  console.error(response.status, session?.error?.code || 'request_failed')
  process.exit(1)
}
console.log(session.session_id, session.status, session.checkout_url)
