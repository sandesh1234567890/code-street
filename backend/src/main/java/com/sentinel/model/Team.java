package com.sentinel.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Entity @Table(name = "teams")
public class Team {
    @Id @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToMany(mappedBy = "teams")
    private Set<User> members;

    @ManyToMany
    @JoinTable(
        name = "teams_submodules",
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "sub_module_id")
    )
    private Set<SubModule> assignedSubModules;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Team() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Set<User> getMembers() { return members; }
    public void setMembers(Set<User> members) { this.members = members; }
    public Set<SubModule> getAssignedSubModules() { return assignedSubModules; }
    public void setAssignedSubModules(Set<SubModule> assignedSubModules) { this.assignedSubModules = assignedSubModules; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public static TeamBuilder builder() { return new TeamBuilder(); }

    public static class TeamBuilder {
        private String name;
        private Project project;

        public TeamBuilder name(String name) { this.name = name; return this; }
        public TeamBuilder project(Project project) { this.project = project; return this; }

        public Team build() {
            Team team = new Team();
            team.setName(name);
            team.setProject(project);
            return team;
        }
    }
}
