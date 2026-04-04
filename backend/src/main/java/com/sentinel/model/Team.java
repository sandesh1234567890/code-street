package com.sentinel.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Entity @Table(name = "teams")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
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

    @Builder.Default
    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
