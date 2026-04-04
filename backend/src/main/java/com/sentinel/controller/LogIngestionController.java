package com.sentinel.controller;

import com.sentinel.dto.LogDTO;
import com.sentinel.model.*;
import com.sentinel.service.LogService;
import com.sentinel.service.GeminiService;
import com.sentinel.repository.IssueRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class LogIngestionController {

    private final LogService logService;
    private final GeminiService geminiService;
    private final IssueRepository issueRepository;

    // Explicit Constructor for Build Reliability
    public LogIngestionController(LogService logService, GeminiService geminiService, IssueRepository issueRepository) {
        this.logService = logService;
        this.geminiService = geminiService;
        this.issueRepository = issueRepository;
    }

    @PostMapping("/logs")
    public ResponseEntity<String> ingestLog(
            @RequestHeader("X-API-KEY") String apiKey,
            @RequestBody LogDTO logDto) {
        
        // ASYNC LOG INGESTION
        logService.ingestLog(apiKey, logDto);
        
        // IMMEDIATE SUCCESS FOR HIGH THROUGHPUT
        return ResponseEntity.accepted().body("Received");
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Log>> getLogs(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(logService.getFilteredLogs(level, search));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(logService.getStats());
    }

    @GetMapping("/issues")
    public ResponseEntity<List<Issue>> getIssues() {
        return ResponseEntity.ok(logService.getAllIssues());
    }

    @PostMapping("/issues/{id}/resolve")
    public ResponseEntity<Void> resolveIssue(@PathVariable UUID id) {
        logService.resolveIssue(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/issues/{id}/analyze")
    public ResponseEntity<Map<String, String>> analyzeIssue(@PathVariable UUID id) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Issue not found"));
        
        String analysis = geminiService.analyzeIssue(issue);
        Map<String, String> result = new HashMap<>();
        result.put("analysis", analysis);
        return ResponseEntity.ok(result);
    }
}
