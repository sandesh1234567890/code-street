package com.sentinel.dto;

import java.time.OffsetDateTime;

public class LogDTO {
    private String level;
    private String message;
    private String stackTrace;
    private Integer durationMs;
    private String environment;
    private String subModuleId;
    private OffsetDateTime timestamp;

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }
    public Integer getDurationMs() { return durationMs; }
    public void setDurationMs(Integer durationMs) { this.durationMs = durationMs; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public String getSubModuleId() { return subModuleId; }
    public void setSubModuleId(String subModuleId) { this.subModuleId = subModuleId; }
    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
}
