package com.sentinel.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "projects")
public class Project {
    @Id @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "api_key", unique = true, nullable = false)
    private String apiKey;
    
    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public static ProjectBuilder builder() { return new ProjectBuilder(); }
    public static class ProjectBuilder {
        private String name; private String apiKey;
        public ProjectBuilder name(String name) { this.name = name; return this; }
        public ProjectBuilder apiKey(String apiKey) { this.apiKey = apiKey; return this; }
        public Project build() { 
            Project p = new Project(); p.setName(name); p.setApiKey(apiKey); return p; 
        }
    }
}
