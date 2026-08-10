package com.tournament.engine.modules.tournament.repository;

import com.tournament.engine.modules.tournament.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query("SELECT DISTINCT m FROM Match m " +
           "LEFT JOIN FETCH m.tournament " +
           "LEFT JOIN FETCH m.team1 t1 " +
           "LEFT JOIN FETCH t1.captain " +
           "LEFT JOIN FETCH m.team2 t2 " +
           "LEFT JOIN FETCH t2.captain " +
           "LEFT JOIN FETCH m.winner " +
           "LEFT JOIN FETCH m.nextMatch " +
           "WHERE m.tournament.id = :tournamentId " +
           "ORDER BY m.roundNumber ASC, m.positionInRound ASC")
    List<Match> findByTournamentIdOrderByRoundNumberAscPositionInRoundAsc(@Param("tournamentId") Long tournamentId);

    List<Match> findByTournamentIdAndRoundNumber(Long tournamentId, Integer roundNumber);

    List<Match> findByStatusAndScheduledTimeBefore(Match.MatchStatus status, LocalDateTime time);

    @Query("SELECT DISTINCT m FROM Match m " +
           "LEFT JOIN FETCH m.tournament " +
           "LEFT JOIN FETCH m.team1 t1 " +
           "LEFT JOIN FETCH t1.captain " +
           "LEFT JOIN FETCH m.team2 t2 " +
           "LEFT JOIN FETCH t2.captain " +
           "LEFT JOIN FETCH m.winner " +
           "LEFT JOIN FETCH m.nextMatch " +
           "WHERE m.status IN :statuses " +
           "ORDER BY m.scheduledTime ASC")
    List<Match> findByStatusInOrderByScheduledTimeAsc(@Param("statuses") List<Match.MatchStatus> statuses);

    List<Match> findByTournamentIdAndStatus(Long tournamentId, Match.MatchStatus status);

    boolean existsByTournamentId(Long tournamentId);
}

