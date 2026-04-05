package com.sentinel.dto;

import java.util.List;

public class BatchLogRequest {
    private List<LogDTO> logs;

    public BatchLogRequest() {}
    public BatchLogRequest(List<LogDTO> logs) { this.logs = logs; }

    public List<LogDTO> getLogs() { return logs; }
    public void setLogs(List<LogDTO> logs) { this.logs = logs; }
}
