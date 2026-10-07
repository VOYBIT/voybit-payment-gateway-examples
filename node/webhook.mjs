import { createHmac, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'

const secret = process.env.VOYBIT_WEBHOOK_SECRET || ''

createServer((request, response) => {
  const chunks = []
  request.on('data', (chunk) => chunks.push(chunk))
  request.on('end', () => {
    const raw = Buffer.concat(chunks)
    const id = request.headers['voybit-webhook-id']
    const timestamp = request.headers['voybit-webhook-timestamp']
    const signature = String(request.headers['voybit-webhook-signature'] || '')
    const hex = signature.startsWith('v1=') ? signature.slice(3) : ''
    const seconds = Number(timestamp)
    const fresh = /^\d+$/.test(String(timestamp)) && Math.abs(Math.floor(Date.now() / 1000) - seconds) <= 300
    const expected = createHmac('sha256', secret).update(`${id}.${timestamp}.`).update(raw).digest()
    const supplied = /^[0-9a-f]{64}$/i.test(hex) ? Buffer.from(hex, 'hex') : Buffer.alloc(0)
    const valid = secret !== '' && fresh && supplied.length === expected.length && timingSafeEqual(expected, supplied)
    response.writeHead(valid ? 204 : 401)
    response.end()
  })
}).listen(8080)
