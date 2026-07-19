package com.tournament.engine.modules.tournament.service;

import com.tournament.engine.modules.tournament.dto.MatchResponse;
import com.tournament.engine.modules.tournament.dto.MatchUpdateRequest;

import java.util.List;

public interface MatchService {
    List<MatchResponse> getMatchesByTournament(Long tournamentId);
    List<MatchResponse> getAllUpcomingMatches();
    void generateBracket(Long tournamentId, Long userId);
    MatchResponse updateMatchResult(Long matchId, MatchUpdateRequest request, Long userId);
}
