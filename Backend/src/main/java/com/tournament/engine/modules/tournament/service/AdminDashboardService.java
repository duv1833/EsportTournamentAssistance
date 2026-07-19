package com.tournament.engine.modules.tournament.service;

import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.identity.repository.UserRepository;
import com.tournament.engine.modules.tournament.dto.DashboardStatsResponse;
import com.tournament.engine.modules.tournament.model.Tournament;
import com.tournament.engine.modules.tournament.repository.TeamRepository;
import com.tournament.engine.modules.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;

    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalTournaments = tournamentRepository.count();
        long pendingTournaments = tournamentRepository.countByApprovalStatus(Tournament.ApprovalStatus.PENDING);
        long totalTeams = teamRepository.count();

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalTournaments(totalTournaments)
                .pendingTournaments(pendingTournaments)
                .totalTeams(totalTeams)
                .build();
    }
}
