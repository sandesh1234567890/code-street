package com.sentinel.controller;

import com.sentinel.dto.BatchLogRequest;
import com.sentinel.dto.LokiPushRequest;
import com.sentinel.model.Log;
import com.sentinel.service.LogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ingest")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LogIngestionController {

    private final LogService logService;

    public LogIngestionController(LogService logService) {
        this.logService = logService;
    }

    @PostMapping("/log")
    public ResponseEntity<Log> ingestLog(
            @RequestBody Map<String, Object> logData,
            @RequestHeader("X-API-KEY") String apiKey) {
        
        // LogService.ingestLog(apiKey, logData)
        Log logEntity = logService.ingestLog(apiKey, logData);
        return ResponseEntity.ok(logEntity);
    }

    @PostMapping("/batch")
    public ResponseEntity<String> ingestBatch(
            @RequestBody BatchLogRequest request,
            @RequestHeader("X-API-KEY") String apiKey) {
        
        // LogService.ingestBatch(apiKey, request)
        logService.ingestBatch(apiKey, request);
        return ResponseEntity.ok("Batch ingested successfully");
    }

    // Loki/Promtail compatible endpoint
    @PostMapping("/loki/api/v1/push")
    public ResponseEntity<String> lokiIngest(
            @RequestBody LokiPushRequest request,
            @RequestHeader(value = "X-API-KEY", required = false) String apiKey) {
        
        // Use a default key if not provided for Promtail convenience in demo
        String finalApiKey = (apiKey != null) ? apiKey : "sentinel-demo-key-2026";
        
        // LogService.ingestLoki(apiKey, request)
        logService.ingestLoki(finalApiKey, request);
        return ResponseEntity.noContent().build();
    }
}
