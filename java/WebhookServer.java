import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

public final class WebhookServer {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8080), 0);
        server.createContext("/webhooks/voybit", exchange -> {
            byte[] raw = exchange.getRequestBody().readAllBytes();
            String secret = System.getenv().getOrDefault("VOYBIT_WEBHOOK_SECRET", "");
            String id = header(exchange, "Voybit-Webhook-Id");
            String timestamp = header(exchange, "Voybit-Webhook-Timestamp");
            String signature = header(exchange, "Voybit-Webhook-Signature");
            int status = valid(secret, id, timestamp, signature, raw) ? 204 : 401;
            exchange.sendResponseHeaders(status, -1);
            exchange.close();
        });
        server.start();
    }

    private static boolean valid(String secret, String id, String timestamp, String signature, byte[] raw) {
        String hex = signature.startsWith("v1=") ? signature.substring(3) : "";
        if (secret.isEmpty() || id.isEmpty() || !timestamp.chars().allMatch(Character::isDigit) || !hex.matches("[0-9a-fA-F]{64}")) {
            return false;
        }
        long seconds = Long.parseLong(timestamp);
        if (Math.abs((System.currentTimeMillis() / 1000L) - seconds) > 300) return false;
        try {
            byte[] supplied = HexFormat.of().parseHex(hex);
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            mac.update((id + "." + timestamp + ".").getBytes(StandardCharsets.UTF_8));
            mac.update(raw);
            return MessageDigest.isEqual(mac.doFinal(), supplied);
        } catch (Exception error) {
            return false;
        }
    }

    private static String header(HttpExchange exchange, String name) {
        return exchange.getRequestHeaders().getFirst(name) == null ? "" : exchange.getRequestHeaders().getFirst(name);
    }
}
