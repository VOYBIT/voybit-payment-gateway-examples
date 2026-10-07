using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

using var handler = new SocketsHttpHandler { AllowAutoRedirect = false };
using var http = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(20) };
using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.voybit.com/api/v1/gateway/payments");
var json = JsonSerializer.Serialize(new
{
    asset_id = Environment.GetEnvironmentVariable("VOYBIT_ASSET_ID"),
    crypto_amount = "25.0000",
    amount_minor = 2500,
    fiat_currency = "USD",
    expires_in_seconds = 1800,
    description = "Order 1001",
    metadata = new { order_id = "1001" }
});
var content = new ByteArrayContent(Encoding.UTF8.GetBytes(json));
content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
request.Content = content;
request.Headers.TryAddWithoutValidation("X-Voybit-Api-Key", Environment.GetEnvironmentVariable("VOYBIT_API_KEY"));
request.Headers.TryAddWithoutValidation("Idempotency-Key", "order:1001:attempt:1");
request.Headers.Accept.ParseAdd("application/json");

using var response = await http.SendAsync(request);
var body = await response.Content.ReadAsStringAsync();
if (!response.IsSuccessStatusCode)
{
    Console.Error.WriteLine($"HTTP {(int)response.StatusCode}");
    Environment.Exit(1);
}
using var payment = JsonDocument.Parse(body);
Console.WriteLine($"{payment.RootElement.GetProperty("id").GetString()} {payment.RootElement.GetProperty("status").GetString()} {payment.RootElement.GetProperty("checkout_url").GetString()}");
