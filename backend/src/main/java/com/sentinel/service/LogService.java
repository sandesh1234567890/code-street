package com.sentinel.service;

import com.sentinel.model.*;
import com.sentinel.dto.LogDTO;
import com.sentinel.repository.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class LogService {

    private static final Logger log = LoggerFactory.getLogger(LogService.class);

    private final LogRepository logRepository;
    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final SubModuleRepository subModuleRepository;

    // Explicit Constructor for Build Reliability
    public LogService(LogRepository logRepository, IssueRepository issueRepository, 
                      ProjectRepository projectRepository, SubModuleRepository subModuleRepository) {
        this.logRepository = logRepository;
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.subModuleRepository = subModuleRepository;
    }

    public Map<String, Object> getStats() {
        long totalLogs = logRepository.count();
        long activeIssues = issueRepository.countByStatus("OPEN");
        long errors = logRepository.countByLevel("ERROR") + logRepository.countByLevel("FATAL");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", totalLogs);
        stats.put("activeIssues", activeIssues);
        stats.put("errorRate", totalLogs > 0 ? (double)errors / totalLogs * 100 : 0);
        return stats;
    }

    public List<Log> getFilteredLogs(String level, String search) {
        // FOR THE DEMO: We lookup the first project. In production, this comes from User Context/Session.
        Project project = projectRepository.findAll().stream().findFirst().orElse(null);
        if (project == null) return Collections.emptyList();

        // RBAC: Filter by SubModules assigned to the user's teams (Simplified for demo)
        // In real app: List<UUID> allowedSubModuleIds = currentUser.getTeams().stream()...
        List<UUID> allowedSubModuleIds = null; // null means allow all for global admin / project manager

        return logRepository.filterLogs(
            project.getId(),
            allowedSubModuleIds,
            (level == null || level.isEmpty() || "ALL".equalsIgnoreCase(level)) ? null : level,
            (search == null || search.isEmpty()) ? null : search
        );
    }

    public List<Issue> getAllIssues() {
        return issueRepository.findAllByOrderByLastSeenDesc();
    }

    @Transactional
    public void resolveIssue(UUID issueId) {
        issueRepository.findById(issueId).ifPresent(issue -> {
            issue.setStatus("RESOLVED");
            issueRepository.save(issue);
        });
    }

    @Async
    @Transactional
    public void ingestLog(String apiKey, LogDTO logDto) {
        // 1. PROJECT LOOKUP
        Optional<Project> projectOpt = projectRepository.findByApiKey(apiKey);
        if (projectOpt.isEmpty()) {
            log.error("Invalid API Key: {}", apiKey);
            return;
        }
        Project project = projectOpt.get();
        
        // 1.1 SUB-MODULE LOOKUP (Optional)
        SubModule subModule = null;
        if (logDto.getSubModuleId() != null) {
            subModule = subModuleRepository.findById(UUID.fromString(logDto.getSubModuleId())).orElse(null);
        }

        // 2. ISSUE GROUPING (If ERROR/FATAL)
        Issue issue = null;
        if (isErrorLevel(logDto.getLevel())) {
            String fingerprint = generateFingerprint(logDto.getStackTrace());
            issue = issueRepository.findByProjectIdAndFingerprint(project.getId(), fingerprint)
                .map(this::incrementIssue)
                .orElseGet(() -> createNewIssue(project, logDto, fingerprint));
        }

        // 3. PERSIST RAW LOG
        Log logEntity = Log.builder()
            .project(project)
            .subModule(subModule)
            .issue(issue)
            .level(logDto.getLevel())
            .environment(logDto.getEnvironment() != null ? logDto.getEnvironment() : "production")
            .message(logDto.getMessage())
            .stackTrace(logDto.getStackTrace())
            .durationMs(logDto.getDurationMs())
            .timestamp(logDto.getTimestamp() != null ? logDto.getTimestamp() : OffsetDateTime.now())
            .build();
        
        logRepository.save(logEntity);
    }

    private boolean isErrorLevel(String level) {
        return "ERROR".equalsIgnoreCase(level) || "FATAL".equalsIgnoreCase(level);
    }

    private Issue incrementIssue(Issue issue) {
        issue.setOccurrenceCount(issue.getOccurrenceCount() + 1);
        issue.setLastSeen(OffsetDateTime.now());
        return issueRepository.save(issue);
    }

    private Issue createNewIssue(Project project, LogDTO dto, String fingerprint) {
        Issue newIssue = Issue.builder()
            .project(project)
            .title(dto.getMessage())
            .fingerprint(fingerprint)
            .level(dto.getLevel())
            .occurrenceCount(1L)
            .firstSeen(OffsetDateTime.now())
            .lastSeen(OffsetDateTime.now())
            .status("OPEN")
            .build();
        return issueRepository.save(newIssue);
    }

    // STACK TRACE FINGERPRINTING LOGIC
    private String generateFingerprint(String stackTrace) {
        if (stackTrace == null || stackTrace.isEmpty()) return "generic_error";
        
        // Normalize stack trace: remove line numbers and memory addresses
        String normalized = stackTrace.replaceAll(":\\d+", "")
                                      .replaceAll("0x[0-9a-fA-F]+", "");
                                      
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(normalized.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            return "hash_error";
        }
    }
}
