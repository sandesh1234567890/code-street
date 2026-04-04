package com.sentinel.sdk;

import com.google.gson.Gson;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.OffsetDateTime;
import java.util.concurrent.*;

@Slf4j
public class SentinelClient {

    private final String apiKey;
    private final String backendUrl;
    private final String environment;
    private final String defaultSubModuleId;
    private final BlockingQueue<LogEntry> logQueue;
    private final HttpClient httpClient;
    private final Gson gson = new Gson();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    private static SentinelClient instance;

    @Builder
    private SentinelClient(String apiKey, String backendUrl, String environment, String defaultSubModuleId, int bufferSize) {
        this.apiKey = apiKey;
        this.backendUrl = backendUrl;
        this.environment = environment != null ? environment : "production";
        this.defaultSubModuleId = defaultSubModuleId;
        this.logQueue = new LinkedBlockingQueue<>(bufferSize > 0 ? bufferSize : 1000);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(5))
                .build();
        
        startFlushWorker();
        setupGlobalExceptionHandler();
    }

    public static synchronized SentinelClient init(String apiKey, String backendUrl, String environment, String defaultSubModuleId) {
        if (instance == null) {
            instance = SentinelClient.builder()
                    .apiKey(apiKey)
                    .backendUrl(backendUrl)
                    .environment(environment)
                    .defaultSubModuleId(defaultSubModuleId)
                    .bufferSize(1000)
                    .build();
        }
        return instance;
    }

    // PUBLIC LOGGING API
    public void log(String level, String message, Throwable throwable) {
        log(level, message, defaultSubModuleId, throwable);
    }

    public void log(String level, String message, String subModuleId, Throwable throwable) {
        LogEntry entry = LogEntry.builder()
                .level(level)
                .message(message)
                .stackTrace(getStackTrace(throwable))
                .environment(environment)
                .subModuleId(subModuleId)
                .timestamp(OffsetDateTime.now())
                .build();
        
        boolean accepted = logQueue.offer(entry);
        if (!accepted) {
            System.err.println("[Sentinel] Buffer full, dropping log: " + message);
        }
    }

    private void startFlushWorker() {
        scheduler.scheduleAtFixedRate(this::flushLogs, 5, 5, TimeUnit.SECONDS);
    }

    private void flushLogs() {
        if (logQueue.isEmpty()) return;

        LogEntry entry;
        while ((entry = logQueue.poll()) != null) {
            sendToBackend(entry);
        }
    }

    private void sendToBackend(LogEntry entry) {
        try {
            String json = gson.toJson(entry);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(backendUrl + "/api/logs"))
                    .header("Content-Type", "application/json")
                    .header("X-API-KEY", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            System.err.println("[Sentinel] Failed to send log: " + e.getMessage());
        }
    }

    private void setupGlobalExceptionHandler() {
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            log("FATAL", "Uncaught exception in thread " + thread.getName(), throwable);
        });
    }

    private String getStackTrace(Throwable t) {
        if (t == null) return null;
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        t.printStackTrace(pw);
        return sw.toString();
    }

    @Data
    @Builder
    public static class LogEntry {
        private String level;
        private String message;
        private String stackTrace;
        private String environment;
        private String subModuleId;
        private OffsetDateTime timestamp;
    }
}
