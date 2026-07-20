package com.tournament.engine.modules.tournament.repository;

import com.tournament.engine.modules.tournament.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByApprovalStatus(Tournament.ApprovalStatus approvalStatus);
    long countByApprovalStatus(Tournament.ApprovalStatus approvalStatus);
}
