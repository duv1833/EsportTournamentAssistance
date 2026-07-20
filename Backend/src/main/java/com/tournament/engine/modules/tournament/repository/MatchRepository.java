package com.tournament.engine.modules.tournament.repository;

import com.tournament.engine.modules.tournament.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByTournamentIdOrderByRoundNumberAscPositionInRoundAsc(Long tournamentId);
    List<Match> findByTournamentIdAndRoundNumber(Long tournamentId, Integer roundNumber);
    List<Match> findByStatusAndScheduledTimeBefore(Match.MatchStatus status, LocalDateTime time);
    List<Match> findByStatusInOrderByScheduledTimeAsc(List<Match.MatchStatus> statuses);
    List<Match> findByTournamentIdAndStatus(Long tournamentId, Match.MatchStatus status);
    boolean existsByTournamentId(Long tournamentId);
}
