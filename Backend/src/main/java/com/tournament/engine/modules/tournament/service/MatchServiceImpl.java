package com.tournament.engine.modules.tournament.service;

import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.identity.repository.UserRepository;
import com.tournament.engine.modules.tournament.dto.MatchResponse;
import com.tournament.engine.modules.tournament.dto.MatchUpdateRequest;
import com.tournament.engine.modules.tournament.model.*;
import com.tournament.engine.modules.tournament.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final TournamentOrganizerRepository organizerRepository;
    private final MatchAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesByTournament(Long tournamentId) {
        List<Match> matches = matchRepository.findByTournamentIdOrderByRoundNumberAscPositionInRoundAsc(tournamentId);
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải đấu!"));
        return matches.stream().map(m -> mapToResponse(m, tournament.getName())).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchResponse> getAllUpcomingMatches() {
        List<Match.MatchStatus> statuses = Arrays.asList(
                Match.MatchStatus.PENDING,
                Match.MatchStatus.LIVE,
                Match.MatchStatus.COMPLETED
        );
        List<Match> matches = matchRepository.findByStatusInOrderByScheduledTimeAsc(statuses);
        return matches.stream().map(m -> mapToResponse(m, m.getTournament().getName())).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void generateBracket(Long tournamentId, Long userId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải đấu!"));

        // Validate permissions: must be Admin, Owner, or Co-Organizer
        validateOrganizerOrAdmin(tournamentId, userId);

        // Check if bracket already exists
        if (matchRepository.existsByTournamentId(tournamentId)) {
            throw new RuntimeException("Giải đấu này đã có sơ đồ thi đấu (bracket) rồi!");
        }

        // Get approved teams
        List<TournamentRegistration> approvedRegs = registrationRepository.findByTournamentId(tournamentId)
                .stream()
                .filter(r -> r.getStatus() == TournamentRegistration.RegistrationStatus.APPROVED)
                .collect(Collectors.toList());

        if (approvedRegs.size() < 2) {
            throw new RuntimeException("Cần ít nhất 2 đội tuyển đã được duyệt để tạo sơ đồ thi đấu!");
        }

        List<Team> teams = approvedRegs.stream()
                .map(TournamentRegistration::getTeam)
                .collect(Collectors.toList());

        // Shuffle teams for random seeding
        Collections.shuffle(teams);

        int teamCount = teams.size();
        // Calculate total rounds: ceil(log2(teamCount))
        int totalRounds = (int) Math.ceil(Math.log(teamCount) / Math.log(2));
        // Total slots in first round (power of 2)
        int bracketSize = (int) Math.pow(2, totalRounds);

        // Build matches from Final back to Round 1
        // Create all matches first, then link them
        List<List<Match>> roundMatches = new ArrayList<>();

        LocalDateTime baseTime = LocalDateTime.now().plusDays(7); // Start 1 week from now

        // Create matches for each round (from round 1 to final)
        for (int round = 1; round <= totalRounds; round++) {
            int matchesInRound = bracketSize / (int) Math.pow(2, round);
            List<Match> matches = new ArrayList<>();

            for (int pos = 1; pos <= matchesInRound; pos++) {
                Match match = Match.builder()
                        .tournament(tournament)
                        .roundNumber(round)
                        .positionInRound(pos)
                        .status(Match.MatchStatus.PENDING)
                        .scheduledTime(baseTime.plusDays((round - 1) * 3).plusHours(pos)) // Spread scheduling
                        .scoreTeam1(0)
                        .scoreTeam2(0)
                        .isLocked(false)
                        .build();
                matches.add(match);
            }
            roundMatches.add(matches);
        }

        // Save all matches first to get IDs
        for (List<Match> matches : roundMatches) {
            matchRepository.saveAll(matches);
        }

        // Link nextMatch references: Round N match -> Round N+1 match
        for (int round = 0; round < totalRounds - 1; round++) {
            List<Match> currentRound = roundMatches.get(round);
            List<Match> nextRound = roundMatches.get(round + 1);

            for (int i = 0; i < currentRound.size(); i++) {
                Match current = currentRound.get(i);
                int nextMatchIndex = i / 2;
                int slot = (i % 2) + 1; // 1 or 2

                if (nextMatchIndex < nextRound.size()) {
                    current.setNextMatch(nextRound.get(nextMatchIndex));
                    current.setNextMatchSlot(slot);
                }
            }
            matchRepository.saveAll(currentRound);
        }

        // Assign teams to Round 1 matches
        List<Match> round1Matches = roundMatches.get(0);
        int teamIndex = 0;
        for (Match match : round1Matches) {
            if (teamIndex < teams.size()) {
                match.setTeam1(teams.get(teamIndex));
                teamIndex++;
            }
            if (teamIndex < teams.size()) {
                match.setTeam2(teams.get(teamIndex));
                teamIndex++;
            }
        }
        matchRepository.saveAll(round1Matches);

        // Update tournament status to IN_PROGRESS
        tournament.setRegistrationStatus(Tournament.RegistrationStatus.IN_PROGRESS);
        tournamentRepository.save(tournament);
    }

    @Override
    @Transactional
    public MatchResponse updateMatchResult(Long matchId, MatchUpdateRequest request, Long userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trận đấu!"));

        // Validate permissions
        validateOrganizerOrAdmin(match.getTournament().getId(), userId);

        User performer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        String oldValue = String.format("score=%d-%d,status=%s,winner=%s",
                match.getScoreTeam1(), match.getScoreTeam2(),
                match.getStatus(),
                match.getWinner() != null ? match.getWinner().getName() : "null");

        // Update scores
        if (request.getScoreTeam1() != null) {
            match.setScoreTeam1(request.getScoreTeam1());
        }
        if (request.getScoreTeam2() != null) {
            match.setScoreTeam2(request.getScoreTeam2());
        }

        // Update scheduled time
        if (request.getScheduledTime() != null) {
            match.setScheduledTime(request.getScheduledTime());
        }

        // Update status
        if (request.getStatus() != null) {
            match.setStatus(Match.MatchStatus.valueOf(request.getStatus()));
        }

        // Set winner and advance to next match
        if (request.getWinnerId() != null) {
            Team winner = null;
            if (match.getTeam1() != null && match.getTeam1().getId().equals(request.getWinnerId())) {
                winner = match.getTeam1();
            } else if (match.getTeam2() != null && match.getTeam2().getId().equals(request.getWinnerId())) {
                winner = match.getTeam2();
            } else {
                throw new RuntimeException("Đội được chọn không tham gia trận đấu này!");
            }

            match.setWinner(winner);
            match.setStatus(Match.MatchStatus.COMPLETED);

            // Auto-advance winner to next match
            if (match.getNextMatch() != null) {
                Match nextMatch = match.getNextMatch();
                if (match.getNextMatchSlot() != null && match.getNextMatchSlot() == 1) {
                    nextMatch.setTeam1(winner);
                } else {
                    nextMatch.setTeam2(winner);
                }
                matchRepository.save(nextMatch);
            }
        }

        matchRepository.save(match);

        // Audit log
        String newValue = String.format("score=%d-%d,status=%s,winner=%s",
                match.getScoreTeam1(), match.getScoreTeam2(),
                match.getStatus(),
                match.getWinner() != null ? match.getWinner().getName() : "null");

        MatchAuditLog log = MatchAuditLog.builder()
                .match(match)
                .performedBy(performer)
                .actionType(MatchAuditLog.AuditActionType.SCORE_SUBMIT)
                .oldValue(oldValue)
                .newValue(newValue)
                .reason("Cập nhật kết quả trận đấu")
                .build();
        auditLogRepository.save(log);

        return mapToResponse(match, match.getTournament().getName());
    }

    private void validateOrganizerOrAdmin(Long tournamentId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        // Admin has full access
        if (user.getGlobalRole() == User.GlobalRole.ADMIN) {
            return;
        }

        // Check if user is an organizer (OWNER, CO_ORGANIZER, or REFEREE) for this tournament
        boolean isOrganizer = organizerRepository.findByTournamentId(tournamentId)
                .stream()
                .anyMatch(o -> o.getUser().getId().equals(userId));

        if (!isOrganizer) {
            throw new RuntimeException("Bạn không có quyền thực hiện thao tác này trên giải đấu này!");
        }
    }

    private MatchResponse mapToResponse(Match match, String tournamentName) {
        return MatchResponse.builder()
                .id(match.getId())
                .tournamentId(match.getTournament().getId())
                .tournamentName(tournamentName)
                .roundNumber(match.getRoundNumber())
                .positionInRound(match.getPositionInRound())
                .team1Id(match.getTeam1() != null ? match.getTeam1().getId() : null)
                .team1Name(match.getTeam1() != null ? match.getTeam1().getName() : null)
                .team1Tag(match.getTeam1() != null ? match.getTeam1().getTag() : null)
                .team1LogoUrl(match.getTeam1() != null ? match.getTeam1().getLogoUrl() : null)
                .team2Id(match.getTeam2() != null ? match.getTeam2().getId() : null)
                .team2Name(match.getTeam2() != null ? match.getTeam2().getName() : null)
                .team2Tag(match.getTeam2() != null ? match.getTeam2().getTag() : null)
                .team2LogoUrl(match.getTeam2() != null ? match.getTeam2().getLogoUrl() : null)
                .scoreTeam1(match.getScoreTeam1())
                .scoreTeam2(match.getScoreTeam2())
                .winnerId(match.getWinner() != null ? match.getWinner().getId() : null)
                .winnerName(match.getWinner() != null ? match.getWinner().getName() : null)
                .status(match.getStatus().name())
                .scheduledTime(match.getScheduledTime())
                .nextMatchId(match.getNextMatch() != null ? match.getNextMatch().getId() : null)
                .nextMatchSlot(match.getNextMatchSlot())
                .build();
    }
}
