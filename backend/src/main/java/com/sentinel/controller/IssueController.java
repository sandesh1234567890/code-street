package com.sentinel.controller;

import com.sentinel.model.Issue;
import com.sentinel.service.GeminiService;
import com.sentinel.service.LogService;
import com.sentinel.repository.IssueRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class IssueController {

    private final LogService logService;
    private final GeminiService geminiService;
    private final IssueRepository issueRepository;

    public IssueController(LogService logService, GeminiService geminiService, IssueRepository issueRepository) {
        this.logService = logService;
        this.geminiService = geminiService;
        this.issueRepository = issueRepository;
    }

    @GetMapping
    public ResponseEntity<List<Issue>> getIssues() {
        return ResponseEntity.ok(issueRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Issue> getIssue(@PathVariable UUID id) {
        return ResponseEntity.of(issueRepository.findById(id));
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<Map<String, String>> analyzeIssue(@PathVariable UUID id) {
        Issue issue = issueRepository.findById(id).orElseThrow();
        String analysis = geminiService.analyzeIssue(issue);
        return ResponseEntity.ok(Map.of("analysis", analysis));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Issue> resolveIssue(@PathVariable UUID id) {
        Issue issue = issueRepository.findById(id).orElseThrow();
        issue.setStatus("RESOLVED");
        return ResponseEntity.ok(issueRepository.save(issue));
    }
}
