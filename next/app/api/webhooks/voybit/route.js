import { verifyWebhook } from 'voybit-payment-gateway'

export async function POST(request) {
  const raw = Buffer.from(await request.arrayBuffer())
  try {
    const event = verifyWebhook({
      secret: process.env.VOYBIT_WEBHOOK_SECRET,
      id: request.headers.get('voybit-webhook-id') || '',
      timestamp: request.headers.get('voybit-webhook-timestamp') || '',
      signature: request.headers.get('voybit-webhook-signature') || '',
      rawBody: raw,
    })
    if (event.status === 'paid' || event.status === 'overpaid') {
      // Fulfil this order once per Voybit-Webhook-Id.
    }
  } catch {
    return new Response(null, { status: 401 })
  }
  return new Response(null, { status: 204 })
}
