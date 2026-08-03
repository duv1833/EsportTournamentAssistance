package com.tournament.engine.modules.tournament.repository;

import com.tournament.engine.modules.tournament.model.MatchAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchAuditLogRepository extends JpaRepository<MatchAuditLog, Long> {
    List<MatchAuditLog> findByMatchIdOrderByCreatedAtDesc(Long matchId);
}
