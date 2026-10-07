require "openssl"
require "socket"

server = TCPServer.new("127.0.0.1", 8080)
trap("INT") { server.close }

loop do
  Thread.new(server.accept) do |client|
    data = +""
    data << client.readpartial(4096) while data !~ /\r\n\r\n/
    head, rest = data.split("\r\n\r\n", 2)
    length = head[/Content-Length: (\d+)/i, 1].to_i
    rest = +"" if rest.nil?
    rest << client.readpartial(length - rest.bytesize) while rest.bytesize < length
    raw = rest.byteslice(0, length).to_s
    secret = ENV.fetch("VOYBIT_WEBHOOK_SECRET", "")
    id = head[/Voybit-Webhook-Id: ([^\r]+)/i, 1].to_s
    timestamp = head[/Voybit-Webhook-Timestamp: ([^\r]+)/i, 1].to_s
    signature = head[/Voybit-Webhook-Signature: ([^\r]+)/i, 1].to_s
    hex = signature.start_with?("v1=") ? signature[3..] : ""
    fresh = timestamp.match?(/\A\d+\z/) && (Time.now.to_i - timestamp.to_i).abs <= 300
    supplied = hex.match?(/\A[0-9a-fA-F]{64}\z/) ? [hex].pack("H*") : "".b
    signed = +"#{id}.#{timestamp}.".b
    signed << raw.b
    expected = OpenSSL::HMAC.digest("SHA256", secret, signed)
    valid = !secret.empty? && fresh && expected.bytesize == supplied.bytesize && OpenSSL.secure_compare(expected, supplied)
    status = valid ? "204 No Content" : "401 Unauthorized"
    client.write("HTTP/1.1 #{status}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n")
  ensure
    client.close
  end
end
