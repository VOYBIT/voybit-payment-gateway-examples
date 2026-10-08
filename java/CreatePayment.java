import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class CreatePayment {
    public static void main(String[] args) throws Exception {
        String body = """
                {"fiat_amount":"25.00","fiat_currency":"USD","payment_window_seconds":1800,"description":"Order 1001","metadata":{"order_id":"1001"}}
                """.trim();
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.voybit.com/api/v1/gateway/checkout-sessions"))
                .timeout(Duration.ofSeconds(20))
                .header("X-Voybit-Api-Key", System.getenv("VOYBIT_API_KEY"))
                .header("Idempotency-Key", "order:1001:attempt:1")
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpClient http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() >= 300) {
            System.err.println("HTTP " + response.statusCode());
            System.exit(1);
        }
        System.out.println(field(response.body(), "session_id") + " " + field(response.body(), "status") + " " + field(response.body(), "checkout_url"));
    }

    private static String field(String json, String name) {
        Matcher matcher = Pattern.compile("\"" + name + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
        return matcher.find() ? matcher.group(1) : "";
    }
}
