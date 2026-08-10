package com.tournament.engine.modules.tournament.repository;

import com.tournament.engine.modules.tournament.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByName(String name);
    Optional<Team> findByInviteCode(String inviteCode);
    Optional<Team> findByInviteCodeIgnoreCase(String inviteCode);

    @Query("SELECT DISTINCT t FROM Team t LEFT JOIN FETCH t.captain LEFT JOIN FETCH t.members m LEFT JOIN FETCH m.user")
    List<Team> findAllWithCaptainAndMembers();
}

