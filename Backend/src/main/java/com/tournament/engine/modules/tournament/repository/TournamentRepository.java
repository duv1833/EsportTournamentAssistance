package com.tournament.engine.modules.tournament.repository;

import com.tournament.engine.modules.tournament.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {

    @Query("SELECT DISTINCT t FROM Tournament t LEFT JOIN FETCH t.creator WHERE t.approvalStatus = :approvalStatus")
    List<Tournament> findByApprovalStatusWithCreator(@Param("approvalStatus") Tournament.ApprovalStatus approvalStatus);

    List<Tournament> findByApprovalStatus(Tournament.ApprovalStatus approvalStatus);

    long countByApprovalStatus(Tournament.ApprovalStatus approvalStatus);

    @Query("SELECT DISTINCT t FROM Tournament t LEFT JOIN FETCH t.creator WHERE t.creator.username = :username")
    List<Tournament> findByCreatorUsernameWithCreator(@Param("username") String username);

    List<Tournament> findByCreatorUsername(String username);
}

