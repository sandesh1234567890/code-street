package com.sentinel.repository;

import com.sentinel.model.SubModule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SubModuleRepository extends JpaRepository<SubModule, UUID> {
    List<SubModule> findByProjectId(UUID projectId);
}
