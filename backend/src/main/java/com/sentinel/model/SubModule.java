package com.sentinel.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "sub_modules")
public class SubModule {
    @Id @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public SubModule() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public static SubModuleBuilder builder() { return new SubModuleBuilder(); }

    public static class SubModuleBuilder {
        private String name;
        private Project project;

        public SubModuleBuilder name(String name) { this.name = name; return this; }
        public SubModuleBuilder project(Project project) { this.project = project; return this; }

        public SubModule build() {
            SubModule sm = new SubModule();
            sm.setName(name);
            sm.setProject(project);
            return sm;
        }
    }
}
