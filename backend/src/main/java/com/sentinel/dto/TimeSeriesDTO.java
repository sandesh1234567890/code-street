package com.sentinel.dto;

import java.time.OffsetDateTime;

public class TimeSeriesDTO {
    private String timestamp;
    private long logs;
    private long errors;

    public TimeSeriesDTO() {}

    public TimeSeriesDTO(String timestamp, long logs, long errors) {
        this.timestamp = timestamp;
        this.logs = logs;
        this.errors = errors;
    }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public long getLogs() { return logs; }
    public void setLogs(long logs) { this.logs = logs; }
    public long getErrors() { return errors; }
    public void setErrors(long errors) { this.errors = errors; }

    public static TimeSeriesDTOBuilder builder() {
        return new TimeSeriesDTOBuilder();
    }

    public static class TimeSeriesDTOBuilder {
        private String timestamp;
        private long logs;
        private long errors;

        public TimeSeriesDTOBuilder timestamp(String timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public TimeSeriesDTOBuilder logs(long logs) {
            this.logs = logs;
            return this;
        }

        public TimeSeriesDTOBuilder errors(long errors) {
            this.errors = errors;
            return this;
        }

        public TimeSeriesDTO build() {
            return new TimeSeriesDTO(timestamp, logs, errors);
        }
    }
}
