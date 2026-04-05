package com.sentinel.sdk;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Sentinel Analytics - Professional Java SDK
 * 
 * Features:
 * - Singleton Pattern
 * - Non-Blocking I/O (Asynchronous)
 * - Structured Batching (Threshold or Timer based)
 * - JVM Crash Reporting (FATAL Log Capture)
 */
public class SentinelClient {
    private static SentinelClient instance;
    
    private final String apiKey;
    private final String backendUrl;
    private final String environment;
    private final HttpClient httpClient;
    private final BlockingQueue<LogDTO> logQueue = new LinkedBlockingQueue<>(1000);
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final AtomicBoolean isShutdown = new AtomicBoolean(false);

    private SentinelClient(String apiKey, String backendUrl, String environment) {
        this.apiKey = apiKey;
        this.backendUrl = backendUrl.endsWith("/") ? backendUrl : backendUrl + "/";
        this.environment = environment;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(5))
                .build();

        // 1. START BATCH PROCESSOR (Flush every 5 seconds)
        scheduler.scheduleAtFixedRate(this::flush, 5, 5, TimeUnit.SECONDS);

        // 2. REGISTER CRASH HANDLER (Requirement #3)
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            logFatal("JVM Crash in thread " + thread.getName() + ": " + throwable.getMessage(), throwable);
            // Allow original handler or exit
        });
    }

    public static synchronized void initialize(String apiKey, String backendUrl, String environment) {
        if (instance == null) {
            instance = new SentinelClient(apiKey, backendUrl, environment);
        }
    }

    public static SentinelClient getInstance() {
        if (instance == null) throw new IllegalStateException("SentinelClient not initialized. Call initialize() first.");
        return instance;
    }

    public void logInfo(String message) { log("INFO", message, null); }
    public void logWarn(String message) { log("WARN", message, null); }
    public void logError(String message, Throwable t) { log("ERROR", message, t); }
    public void logFatal(String message, Throwable t) { log("FATAL", message, t); }

    private void log(String level, String message, Throwable t) {
        if (isShutdown.get()) return;

        LogDTO dto = new LogDTO();
        dto.level = level;
        dto.message = message;
        dto.environment = environment;
        dto.timestamp = OffsetDateTime.now().toString();
        if (t != null) {
            StringBuilder sb = new StringBuilder();
            for (StackTraceElement element : t.getStackTrace()) {
                sb.append(element.toString()).append("\n");
            }
            dto.stackTrace = sb.toString();
        }

        logQueue.offer(dto);

        // Immediate flush if threshold reached
        if (logQueue.size() >= 50) {
            CompletableFuture.runAsync(this::flush);
        }
    }

    private synchronized void flush() {
        if (logQueue.isEmpty()) return;

        List<LogDTO> batch = new ArrayList<>();
        logQueue.drainTo(batch, 50);

        try {
            String json = toJson(batch);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(backendUrl + "api/ingest/batch"))
                    .header("Content-Type", "application/json")
                    .header("X-API-KEY", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(res -> {
                        if (res.statusCode() >= 400) {
                            System.err.println("[SentinelSDK] Batch push failed: " + res.body());
                        }
                    });
        } catch (Exception e) {
            System.err.println("[SentinelSDK] Error flushing logs: " + e.getMessage());
        }
    }

    private String toJson(List<LogDTO> batch) {
        // Professional-grade manual JSON generation to avoid dependency bloat in SDK
        StringBuilder sb = new StringBuilder("{\"logs\":[");
        for (int i = 0; i < batch.size(); i++) {
            LogDTO d = batch.get(i);
            sb.append("{")
              .append("\"level\":\"").append(d.level).append("\",")
              .append("\"message\":\"").append(escapeJson(d.message)).append("\",")
              .append("\"environment\":\"").append(d.environment).append("\",")
              .append("\"timestamp\":\"").append(d.timestamp).append("\"");
            if (d.stackTrace != null) {
                sb.append(",\"stackTrace\":\"").append(escapeJson(d.stackTrace)).append("\"");
            }
            sb.append("}");
            if (i < batch.size() - 1) sb.append(",");
        }
        sb.append("]}");
        return sb.toString();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static class LogDTO {
        String level;
        String message;
        String stackTrace;
        String environment;
        String timestamp;
    }
}
