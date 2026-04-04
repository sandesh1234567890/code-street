package com.sentinel.repository;

import com.sentinel.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IssueRepository extends JpaRepository<Issue, UUID> {
    List<Issue> findAllByOrderByLastSeenDesc();
    long countByStatus(String status);
    Optional<Issue> findByProjectIdAndFingerprint(UUID projectId, String fingerprint);
}
