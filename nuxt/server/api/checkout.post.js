import { createClient } from 'voybit-payment-gateway'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const orderId = String(body?.order_id || '')
  if (!/^[A-Za-z0-9._:-]{1,80}$/.test(orderId)) {
    setResponseStatus(event, 400)
    return { error: { message: 'order_id is invalid' } }
  }
  const voybit = createClient({ apiKey: process.env.VOYBIT_API_KEY })
  const created = await voybit.createCheckoutSession({
    fiat_amount: '25.00',
    fiat_currency: 'USD',
    description: `Order ${orderId}`,
    metadata: { order_id: orderId },
  }, `order:${orderId}:attempt:1`)
  return { checkout_url: created.checkoutSession.checkout_url }
})
