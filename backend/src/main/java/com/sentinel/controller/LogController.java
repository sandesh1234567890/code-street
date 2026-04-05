package com.sentinel.controller;

import com.sentinel.dto.TimeSeriesDTO;
import com.sentinel.model.Log;
import com.sentinel.service.LogService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LogController {

    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(logService.getStats());
    }

    @GetMapping("/series")
    public ResponseEntity<List<TimeSeriesDTO>> getSeries() {
        return ResponseEntity.ok(logService.getTimeSeriesStats());
    }

    @GetMapping
    public ResponseEntity<List<Log>> getLogs(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        return ResponseEntity.ok(logService.getFilteredLogs(level, search));
    }

    @GetMapping("/export")
    public ResponseEntity<ByteArrayResource> exportLogs(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search) {
        
        List<Log> logs = logService.getFilteredLogs(level, search);
        
        StringBuilder csv = new StringBuilder("Timestamp,Level,Environment,Message\n");
        for (Log log : logs) {
            csv.append(String.format("%s,%s,%s,\"%s\"\n", 
                log.getTimestamp(), 
                log.getLevel(), 
                log.getEnvironment(), 
                log.getMessage().replace("\"", "'")));
        }

        byte[] data = csv.toString().getBytes();
        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sentinel-report-" + System.currentTimeMillis() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(data.length)
                .body(resource);
    }
}
