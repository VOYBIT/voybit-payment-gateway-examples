import { createHmac, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'

createServer((request, response) => {
  const chunks = []
  request.on('data', (chunk) => chunks.push(chunk))
  request.on('end', () => {
    const raw = Buffer.concat(chunks)
    const id = request.headers['voybit-webhook-id']
    const timestamp = request.headers['voybit-webhook-timestamp']
    const signature = request.headers['voybit-webhook-signature'] || ''
    const supplied = Buffer.from(signature.slice(3), 'hex')
    const seconds = Number(timestamp)
    const fresh = Number.isInteger(seconds) && Math.abs(Math.floor(Date.now() / 1000) - seconds) <= 300
    const expected = createHmac('sha256', process.env.VOYBIT_WEBHOOK_SECRET).update(`${id}.${timestamp}.`).update(raw).digest()
    const valid = signature.startsWith('v1=') && fresh && expected.length === supplied.length && timingSafeEqual(expected, supplied)
    response.writeHead(valid ? 204 : 401)
    response.end()
  })
}).listen(8080)
