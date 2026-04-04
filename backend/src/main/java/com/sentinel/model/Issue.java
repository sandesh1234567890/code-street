package com.sentinel.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "issues")
public class Issue {
    @Id @GeneratedValue(generator = "UUID")
    private UUID id;
    
    @ManyToOne @JoinColumn(name = "project_id")
    private Project project;
    
    private String title;
    private String fingerprint; 
    private String level; 
    
    @Column(name = "occurrence_count")
    private Long occurrenceCount = 1L;
    
    @Column(name = "first_seen")
    private OffsetDateTime firstSeen = OffsetDateTime.now();
    
    @Column(name = "last_seen")
    private OffsetDateTime lastSeen = OffsetDateTime.now();
    
    private String status = "OPEN";

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getFingerprint() { return fingerprint; }
    public void setFingerprint(String fingerprint) { this.fingerprint = fingerprint; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public Long getOccurrenceCount() { return occurrenceCount; }
    public void setOccurrenceCount(Long occurrenceCount) { this.occurrenceCount = occurrenceCount; }
    public OffsetDateTime getFirstSeen() { return firstSeen; }
    public void setFirstSeen(OffsetDateTime firstSeen) { this.firstSeen = firstSeen; }
    public OffsetDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(OffsetDateTime lastSeen) { this.lastSeen = lastSeen; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static IssueBuilder builder() { return new IssueBuilder(); }
    public static class IssueBuilder {
        private Project project; private String title; private String fingerprint; private String level; 
        private Long occurrenceCount; private OffsetDateTime firstSeen; private OffsetDateTime lastSeen; private String status;
        public IssueBuilder project(Project p) { this.project = p; return this; }
        public IssueBuilder title(String t) { this.title = t; return this; }
        public IssueBuilder fingerprint(String f) { this.fingerprint = f; return this; }
        public IssueBuilder level(String l) { this.level = l; return this; }
        public IssueBuilder occurrenceCount(Long c) { this.occurrenceCount = c; return this; }
        public IssueBuilder firstSeen(OffsetDateTime s) { this.firstSeen = s; return this; }
        public IssueBuilder lastSeen(OffsetDateTime s) { this.lastSeen = s; return this; }
        public IssueBuilder status(String s) { this.status = s; return this; }
        public Issue build() {
            Issue i = new Issue(); i.setProject(project); i.setTitle(title); i.setFingerprint(fingerprint); 
            i.setLevel(level); i.setOccurrenceCount(occurrenceCount); 
            i.setFirstSeen(firstSeen); i.setLastSeen(lastSeen); i.setStatus(status); return i;
        }
    }
}
