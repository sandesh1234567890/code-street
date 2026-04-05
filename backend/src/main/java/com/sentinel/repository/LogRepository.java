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
    
    // Standard JPA Filter (Compatible across H2 and PostgreSQL for demo reliability)
    @Query("SELECT l FROM Log l WHERE " +
           "l.project.id = :projectId AND " +
           "(:subModuleIds IS NULL OR l.subModule.id IN :subModuleIds) AND " +
           "(:level IS NULL OR l.level = :level) AND " +
           "(:search IS NULL OR LOWER(l.message) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY l.timestamp DESC")
    List<Log> filterLogs(UUID projectId, List<UUID> subModuleIds, String level, String search);

    // nativeQuery = true with standard SQL syntax for cross-DB compatibility
    @Query(value = "SELECT timestamp as hr, " +
                   "COUNT(*) as total, " +
                   "SUM(CASE WHEN level IN ('ERROR', 'FATAL') THEN 1 ELSE 0 END) as errs " +
                   "FROM logs WHERE project_id = :projectId " +
                   "AND timestamp > :since " +
                   "GROUP BY hr ORDER BY hr ASC", nativeQuery = true)
    List<Object[]> getLogSeries(UUID projectId, java.time.OffsetDateTime since);
}
