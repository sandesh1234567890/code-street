package com.sentinel.service;

import com.sentinel.model.*;
import com.sentinel.dto.BatchLogRequest;
import com.sentinel.dto.LokiPushRequest;
import com.sentinel.dto.LogDTO;
import com.sentinel.dto.TimeSeriesDTO;
import com.sentinel.repository.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

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
    private final UserRepository userRepository;

    public LogService(LogRepository logRepository, IssueRepository issueRepository, 
                      ProjectRepository projectRepository, SubModuleRepository subModuleRepository,
                      UserRepository userRepository) {
        this.logRepository = logRepository;
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.subModuleRepository = subModuleRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getStats() {
        long totalLogs = logRepository.count();
        long activeIssues = issueRepository.countByStatus("OPEN");
        long errors = logRepository.countByLevel("ERROR") + logRepository.countByLevel("FATAL");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", totalLogs);
        stats.put("activeIssues", activeIssues);
        stats.put("errorRate", totalLogs > 0 ? (double)errors / totalLogs * 100 : 0);
        stats.put("ingestionThroughput", totalLogs > 0 ? (double)totalLogs / 24 : 0); // Simplified for demo
        return stats;
    }

    public List<TimeSeriesDTO> getTimeSeriesStats() {
        Project project = projectRepository.findAll().stream().findFirst().orElse(null);
        if (project == null) return Collections.emptyList();

        OffsetDateTime since = OffsetDateTime.now().minusHours(24);
        List<Object[]> results = logRepository.getLogSeries(project.getId(), since);
        
        List<TimeSeriesDTO> series = new ArrayList<>();
        for (Object[] row : results) {
            Object timestampObj = row[0];
            String hourStr = "00:00";
            
            if (timestampObj instanceof java.sql.Timestamp) {
                hourStr = ((java.sql.Timestamp) timestampObj).toLocalDateTime().getHour() + ":00";
            } else if (timestampObj instanceof OffsetDateTime) {
                hourStr = ((OffsetDateTime) timestampObj).getHour() + ":00";
            } else {
                hourStr = timestampObj.toString().substring(11, 16); // Fallback for string types
            }

            series.add(TimeSeriesDTO.builder()
                .timestamp(hourStr)
                .logs(((Number) row[1]).longValue())
                .errors(((Number) row[2]).longValue())
                .build());
        }
        return series;
    }

    public List<Log> getFilteredLogs(String level, String search) {
        Project project = projectRepository.findAll().stream().findFirst().orElse(null);
        if (project == null) return Collections.emptyList();

        List<UUID> allowedSubModuleIds = getCurrentUserAllowedSubModules();
        
        return logRepository.filterLogs(
            project.getId(),
            allowedSubModuleIds,
            (level == null || level.isEmpty() || "ALL".equalsIgnoreCase(level)) ? null : level,
            (search == null || search.isEmpty()) ? null : search
        );
    }

    private List<UUID> getCurrentUserAllowedSubModules() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails) ? ((UserDetails)principal).getUsername() : principal.toString();
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || "ADMIN".equals(user.getRole()) || "MANAGER".equals(user.getRole())) {
            return null; // No restrictions for ADMIN/MANAGER
        }
        
        // Filter for DEVELOPER: only sub-modules in their assigned teams
        List<UUID> subModuleIds = new ArrayList<>();
        if (user.getTeams() != null) {
            for (Team team : user.getTeams()) {
                if (team.getAssignedSubModules() != null) {
                    for (SubModule sm : team.getAssignedSubModules()) {
                        subModuleIds.add(sm.getId());
                    }
                }
            }
        }
        return subModuleIds.isEmpty() ? List.of(UUID.randomUUID()) : subModuleIds; // Return dummy if none to block all
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

    @Transactional
    public Log ingestLog(String apiKey, Map<String, Object> logData) {
        LogDTO dto = new LogDTO();
        dto.setLevel((String) logData.getOrDefault("level", "INFO"));
        dto.setMessage((String) logData.getOrDefault("message", "N/A"));
        dto.setEnvironment((String) logData.getOrDefault("environment", "production"));
        dto.setStackTrace((String) logData.get("stackTrace"));
        dto.setDurationMs((Integer) logData.get("durationMs"));
        
        return processIncomingLog(apiKey, dto);
    }

    @Async
    @Transactional
    public void ingestBatch(String apiKey, BatchLogRequest request) {
        if (request.getLogs() == null) return;
        for (LogDTO logDto : request.getLogs()) {
            processIncomingLog(apiKey, logDto);
        }
    }

    @Async
    @Transactional
    public void ingestLoki(String apiKey, LokiPushRequest request) {
        if (request.getStreams() == null) return;
        
        for (LokiPushRequest.Stream stream : request.getStreams()) {
            Map<String, String> labels = stream.getStream();
            String environment = labels.getOrDefault("env", "production");
            String levelFromLabel = labels.getOrDefault("level", "INFO");

            for (List<String> value : stream.getValues()) {
                if (value.size() < 2) continue;
                
                String timestampNanoStr = value.get(0);
                String logLine = value.get(1);

                // Create a temporary LogDTO for common processing (using manual setters since builder might be missing fields)
                LogDTO logDto = new LogDTO();
                logDto.setMessage(logLine);
                logDto.setLevel(inferLevel(logLine, levelFromLabel));
                logDto.setEnvironment(environment);
                logDto.setTimestamp(parseLokiTimestamp(timestampNanoStr));
                
                processIncomingLog(apiKey, logDto);
            }
        }
    }

    private Log processIncomingLog(String apiKey, LogDTO logDto) {
        // 1. PROJECT LOOKUP
        Optional<Project> projectOpt = projectRepository.findByApiKey(apiKey);
        if (projectOpt.isEmpty()) {
            log.error("Invalid API Key: {}", apiKey);
            return null;
        }
        Project project = projectOpt.get();
        
        // 1.1 SUB-MODULE LOOKUP (Optional)
        SubModule subModule = null;
        if (logDto.getSubModuleId() != null) {
            try {
                subModule = subModuleRepository.findById(UUID.fromString(logDto.getSubModuleId())).orElse(null);
            } catch (Exception e) { /* Ignore invalid UUIDs */ }
        }

        // 2. ISSUE GROUPING (If ERROR/FATAL)
        Issue issue = null;
        if (isErrorLevel(logDto.getLevel())) {
            String fingerprint = generateFingerprint(logDto.getStackTrace() != null ? logDto.getStackTrace() : logDto.getMessage());
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
        
        return logRepository.save(logEntity);
    }

    private String inferLevel(String line, String defaultLevel) {
        String upper = line.toUpperCase();
        if (upper.contains("ERROR") || upper.contains("FATAL") || upper.contains("EXCEPTION")) return "ERROR";
        if (upper.contains("WARN")) return "WARN";
        if (upper.contains("DEBUG")) return "DEBUG";
        return defaultLevel;
    }

    private OffsetDateTime parseLokiTimestamp(String nanoStr) {
        try {
            // Loki sends nanoseconds. Java OffsetDateTime needs seconds + offset or Instant.
            long nanos = Long.parseLong(nanoStr);
            long seconds = nanos / 1_000_000_000L;
            int remainingNanos = (int) (nanos % 1_000_000_000L);
            return OffsetDateTime.ofInstant(java.time.Instant.ofEpochSecond(seconds, remainingNanos), java.time.ZoneOffset.UTC);
        } catch (Exception e) {
            return OffsetDateTime.now();
        }
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
