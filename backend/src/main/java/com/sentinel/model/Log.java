package com.sentinel.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "logs")
public class Log {
    @Id @GeneratedValue(generator = "UUID")
    private UUID id;
    
    @ManyToOne @JoinColumn(name = "project_id")
    private Project project;
    
    @ManyToOne @JoinColumn(name = "sub_module_id")
    private SubModule subModule;

    @ManyToOne @JoinColumn(name = "issue_id")
    private Issue issue;
    
    private String level;
    private String environment; // prod, staging, dev
    @Column(columnDefinition = "TEXT")
    private String message;
    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;
    
    @Column(name = "duration_ms")
    private Integer durationMs;
    
    private OffsetDateTime timestamp = OffsetDateTime.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public SubModule getSubModule() { return subModule; }
    public void setSubModule(SubModule subModule) { this.subModule = subModule; }
    public Issue getIssue() { return issue; }
    public void setIssue(Issue issue) { this.issue = issue; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }
    public Integer getDurationMs() { return durationMs; }
    public void setDurationMs(Integer durationMs) { this.durationMs = durationMs; }
    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }

    public static LogBuilder builder() { return new LogBuilder(); }
    public static class LogBuilder {
        private Project project; private SubModule subModule; private Issue issue; private String level; private String environment; private String message; private String stackTrace; private Integer durationMs; private OffsetDateTime timestamp;
        public LogBuilder project(Project p) { this.project = p; return this; }
        public LogBuilder subModule(SubModule sm) { this.subModule = sm; return this; }
        public LogBuilder issue(Issue i) { this.issue = i; return this; }
        public LogBuilder level(String l) { this.level = l; return this; }
        public LogBuilder environment(String e) { this.environment = e; return this; }
        public LogBuilder message(String m) { this.message = m; return this; }
        public LogBuilder stackTrace(String s) { this.stackTrace = s; return this; }
        public LogBuilder durationMs(Integer d) { this.durationMs = d; return this; }
        public LogBuilder timestamp(OffsetDateTime t) { this.timestamp = t; return this; }
        public Log build() {
            Log l = new Log(); l.setProject(project); l.setSubModule(subModule); l.setIssue(issue); l.setLevel(level); l.setEnvironment(environment); l.setMessage(message); l.setStackTrace(stackTrace); l.setDurationMs(durationMs); l.setTimestamp(timestamp); return l;
        }
    }
}
