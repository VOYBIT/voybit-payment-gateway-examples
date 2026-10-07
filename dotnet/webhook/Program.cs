using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/webhooks/voybit", async (HttpRequest request) =>
{
    using var buffer = new MemoryStream();
    await request.Body.CopyToAsync(buffer);
    var raw = buffer.ToArray();
    var secret = Environment.GetEnvironmentVariable("VOYBIT_WEBHOOK_SECRET") ?? "";
    var id = request.Headers["Voybit-Webhook-Id"].ToString();
    var timestamp = request.Headers["Voybit-Webhook-Timestamp"].ToString();
    var signature = request.Headers["Voybit-Webhook-Signature"].ToString();
    return Valid(secret, id, timestamp, signature, raw) ? Results.NoContent() : Results.Unauthorized();
});

app.Run();

static bool Valid(string secret, string id, string timestamp, string signature, byte[] raw)
{
    var hex = signature.StartsWith("v1=", StringComparison.Ordinal) ? signature[3..] : "";
    if (secret.Length == 0 || id.Length == 0 || !long.TryParse(timestamp, out var seconds) || hex.Length != 64)
        return false;
    if (Math.Abs(DateTimeOffset.UtcNow.ToUnixTimeSeconds() - seconds) > 300)
        return false;
    byte[] supplied;
    try
    {
        supplied = Convert.FromHexString(hex);
    }
    catch (FormatException)
    {
        return false;
    }
    var prefix = Encoding.UTF8.GetBytes($"{id}.{timestamp}.");
    var signed = new byte[prefix.Length + raw.Length];
    prefix.CopyTo(signed, 0);
    raw.CopyTo(signed, prefix.Length);
    var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), signed);
    return supplied.Length == expected.Length && CryptographicOperations.FixedTimeEquals(expected, supplied);
}
