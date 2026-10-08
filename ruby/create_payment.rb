require "json"
require "net/http"
require "uri"

body = {
  fiat_amount: "25.00",
  fiat_currency: "USD",
  payment_window_seconds: 1800,
  description: "Order 1001",
  metadata: { order_id: "1001" }
}
uri = URI("https://api.voybit.com/api/v1/gateway/checkout-sessions")
request = Net::HTTP::Post.new(uri)
request["X-Voybit-Api-Key"] = ENV["VOYBIT_API_KEY"]
request["Idempotency-Key"] = "order:1001:attempt:1"
request["Content-Type"] = "application/json"
request["Accept"] = "application/json"
request.body = JSON.generate(body)
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
http.open_timeout = 20
http.read_timeout = 20
response = http.request(request)
session = JSON.parse(response.body)
unless response.code.to_i < 300
  warn "HTTP #{response.code}"
  exit 1
end
puts "#{session["session_id"]} #{session["status"]} #{session["checkout_url"]}"
