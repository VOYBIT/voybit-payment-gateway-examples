'use client'

export function PayButton({ orderId }) {
  async function pay() {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok || typeof body.checkout_url !== 'string') return
    window.location.assign(body.checkout_url)
  }

  return <button type="button" onClick={pay}>Pay</button>
}
