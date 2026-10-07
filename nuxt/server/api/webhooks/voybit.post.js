import { verifyWebhook } from 'voybit-payment-gateway'

export default defineEventHandler(async (event) => {
  const raw = (await readRawBody(event, false)) || Buffer.alloc(0)
  try {
    const payload = verifyWebhook({
      secret: process.env.VOYBIT_WEBHOOK_SECRET,
      id: getHeader(event, 'voybit-webhook-id') || '',
      timestamp: getHeader(event, 'voybit-webhook-timestamp') || '',
      signature: getHeader(event, 'voybit-webhook-signature') || '',
      rawBody: raw,
    })
    if (payload.status === 'paid' || payload.status === 'overpaid') {
      // Fulfil this order once per Voybit-Webhook-Id.
    }
  } catch {
    setResponseStatus(event, 401)
    return null
  }
  setResponseStatus(event, 204)
  return null
})
