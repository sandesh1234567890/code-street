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

    public LogDTO() {}

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

    public static LogDTOBuilder builder() { return new LogDTOBuilder(); }

    public static class LogDTOBuilder {
        private String level;
        private String message;
        private String stackTrace;
        private Integer durationMs;
        private String environment;
        private String subModuleId;
        private OffsetDateTime timestamp;

        public LogDTOBuilder level(String level) { this.level = level; return this; }
        public LogDTOBuilder message(String message) { this.message = message; return this; }
        public LogDTOBuilder stackTrace(String stackTrace) { this.stackTrace = stackTrace; return this; }
        public LogDTOBuilder durationMs(Integer durationMs) { this.durationMs = durationMs; return this; }
        public LogDTOBuilder environment(String environment) { this.environment = environment; return this; }
        public LogDTOBuilder subModuleId(String subModuleId) { this.subModuleId = subModuleId; return this; }
        public LogDTOBuilder timestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; return this; }

        public LogDTO build() {
            LogDTO dto = new LogDTO();
            dto.setLevel(level);
            dto.setMessage(message);
            dto.setStackTrace(stackTrace);
            dto.setDurationMs(durationMs);
            dto.setEnvironment(environment);
            dto.setSubModuleId(subModuleId);
            dto.setTimestamp(timestamp);
            return dto;
        }
    }
}
