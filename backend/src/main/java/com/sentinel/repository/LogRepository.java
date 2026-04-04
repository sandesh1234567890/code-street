package com.sentinel.repository;

import com.sentinel.model.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LogRepository extends JpaRepository<Log, UUID> {
    long countByLevel(String level);
    
    @Query("SELECT l FROM Log l WHERE " +
           "l.project.id = :projectId AND " +
           "(:subModuleIds IS NULL OR l.subModule.id IN :subModuleIds) AND " +
           "(:level IS NULL OR l.level = :level) AND " +
           "(:search IS NULL OR LOWER(l.message) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY l.timestamp DESC")
    List<Log> filterLogs(UUID projectId, List<UUID> subModuleIds, String level, String search);
}
