package com.tournament.engine.modules.tournament.repository;

import com.tournament.engine.modules.tournament.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeamId(Long teamId);
    List<TeamMember> findByTeamIdAndStatus(Long teamId, TeamMember.MembershipStatus status);
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);
    int countByTeamIdAndStatus(Long teamId, TeamMember.MembershipStatus status);

    @Query("SELECT tm.user.id, tm.team.id FROM TeamMember tm WHERE tm.user IS NOT NULL AND tm.team IS NOT NULL")
    List<Object[]> findAllUserTeamIds();
}

