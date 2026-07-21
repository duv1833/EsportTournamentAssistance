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
    private final TeamRepository teamRepository;

    @Override
    @Transactional(readOnly = true)
    public MatchResponse getMatchById(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trận đấu!"));
        return mapToResponse(match, match.getTournament().getName());
    }

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
    public void generateBracket(Long tournamentId, Long userId, com.tournament.engine.modules.tournament.dto.GenerateBracketRequest request) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải đấu!"));

        validateOrganizerOrAdmin(tournamentId, userId);

        if (matchRepository.existsByTournamentId(tournamentId)) {
            throw new RuntimeException("Giải đấu này đã có sơ đồ thi đấu (bracket) rồi!");
        }

        List<TournamentRegistration> approvedRegs = registrationRepository.findByTournamentId(tournamentId)
                .stream()
                .filter(r -> r.getStatus() == TournamentRegistration.RegistrationStatus.APPROVED)
                .collect(Collectors.toList());

        List<Team> teams = approvedRegs.stream()
                .map(TournamentRegistration::getTeam)
                .collect(Collectors.toList());

        Collections.shuffle(teams);
        LocalDateTime baseTime = LocalDateTime.now().plusDays(7);

        if (tournament.getStructure() == Tournament.TournamentStructure.GROUP_KNOCKOUT) {
            if (teams.size() < 8) {
                throw new RuntimeException("Thể thức Vòng bảng cần ít nhất 8 đội để đánh Tứ kết!");
            }
            List<Team> groupA = teams.subList(0, teams.size() / 2);
            List<Team> groupB = teams.subList(teams.size() / 2, teams.size());
            
            generateRoundRobinMatches(tournament, groupA, "A", baseTime, request);
            generateRoundRobinMatches(tournament, groupB, "B", baseTime, request);
            
            // Generate empty knockout bracket for 8 teams (3 rounds: QF, SF, Final)
            generateEmptyKnockoutBracket(tournament, 3, baseTime.plusDays(7), request, false, null);
        } else {
            if (teams.size() < 2) {
                throw new RuntimeException("Cần ít nhất 2 đội tuyển đã được duyệt để tạo sơ đồ thi đấu!");
            }
            int teamCount = teams.size();
            int totalRounds = (int) Math.ceil(Math.log(teamCount) / Math.log(2));
            generateEmptyKnockoutBracket(tournament, totalRounds, baseTime, request, true, teams);
        }

        tournament.setRegistrationStatus(Tournament.RegistrationStatus.IN_PROGRESS);
        tournamentRepository.save(tournament);
    }

    private void generateRoundRobinMatches(Tournament tournament, List<Team> teams, String groupName, LocalDateTime baseTime, com.tournament.engine.modules.tournament.dto.GenerateBracketRequest request) {
        Tournament.MatchFormat roundFormat;
        try {
            roundFormat = Tournament.MatchFormat.valueOf(request.getEarlyRoundsFormat() != null ? request.getEarlyRoundsFormat() : "BO1");
        } catch (IllegalArgumentException e) {
            roundFormat = Tournament.MatchFormat.BO1;
        }

        int matchCount = 0;
        for (int i = 0; i < teams.size(); i++) {
            for (int j = i + 1; j < teams.size(); j++) {
                Match match = Match.builder()
                        .tournament(tournament)
                        .roundNumber(0) // 0 for group stage
                        .positionInRound(++matchCount)
                        .status(Match.MatchStatus.PENDING)
                        .scheduledTime(baseTime.plusHours(matchCount * 2))
                        .scoreTeam1(0)
                        .scoreTeam2(0)
                        .isLocked(false)
                        .format(roundFormat)
                        .stage(Match.MatchStage.GROUP)
                        .groupName(groupName)
                        .team1(teams.get(i))
                        .team2(teams.get(j))
                        .build();
                matchRepository.save(match);
            }
        }
    }

    private void generateEmptyKnockoutBracket(Tournament tournament, int totalRounds, LocalDateTime baseTime, com.tournament.engine.modules.tournament.dto.GenerateBracketRequest request, boolean assignTeams, List<Team> teams) {
        int bracketSize = (int) Math.pow(2, totalRounds);
        List<List<Match>> roundMatches = new ArrayList<>();

        for (int round = 1; round <= totalRounds; round++) {
            int matchesInRound = bracketSize / (int) Math.pow(2, round);
            List<Match> matches = new ArrayList<>();

            Tournament.MatchFormat roundFormat;
            try {
                if (round == totalRounds) {
                    roundFormat = Tournament.MatchFormat.valueOf(request.getFinalsFormat() != null ? request.getFinalsFormat() : "BO3");
                } else if (round == totalRounds - 1 && totalRounds > 1) {
                    roundFormat = Tournament.MatchFormat.valueOf(request.getSemiFinalsFormat() != null ? request.getSemiFinalsFormat() : "BO3");
                } else {
                    roundFormat = Tournament.MatchFormat.valueOf(request.getEarlyRoundsFormat() != null ? request.getEarlyRoundsFormat() : "BO3");
                }
            } catch (IllegalArgumentException e) {
                roundFormat = Tournament.MatchFormat.BO3;
            }

            for (int pos = 1; pos <= matchesInRound; pos++) {
                Match match = Match.builder()
                        .tournament(tournament)
                        .roundNumber(round)
                        .positionInRound(pos)
                        .status(Match.MatchStatus.PENDING)
                        .scheduledTime(baseTime.plusDays((round - 1) * 3).plusHours(pos))
                        .scoreTeam1(0)
                        .scoreTeam2(0)
                        .isLocked(false)
                        .format(roundFormat)
                        .stage(Match.MatchStage.KNOCKOUT)
                        .build();
                matches.add(match);
            }
            roundMatches.add(matches);
        }

        for (List<Match> matches : roundMatches) {
            matchRepository.saveAll(matches);
        }

        for (int round = 0; round < totalRounds - 1; round++) {
            List<Match> currentRound = roundMatches.get(round);
            List<Match> nextRound = roundMatches.get(round + 1);

            for (int i = 0; i < currentRound.size(); i++) {
                Match current = currentRound.get(i);
                int nextMatchIndex = i / 2;
                int slot = (i % 2) + 1;

                if (nextMatchIndex < nextRound.size()) {
                    current.setNextMatch(nextRound.get(nextMatchIndex));
                    current.setNextMatchSlot(slot);
                }
            }
            matchRepository.saveAll(currentRound);
        }

        if (assignTeams && teams != null) {
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
        }
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

    @Override
    @Transactional(readOnly = true)
    public List<com.tournament.engine.modules.tournament.dto.TournamentGroupStanding> getGroupStandings(Long tournamentId) {
        List<Match> groupMatches = matchRepository.findByTournamentIdOrderByRoundNumberAscPositionInRoundAsc(tournamentId)
                .stream().filter(m -> m.getStage() == Match.MatchStage.GROUP).collect(Collectors.toList());

        Map<String, Map<Long, com.tournament.engine.modules.tournament.dto.TournamentGroupStanding>> standingsMap = new HashMap<>();

        for (Match m : groupMatches) {
            String groupName = m.getGroupName();
            standingsMap.putIfAbsent(groupName, new HashMap<>());
            Map<Long, com.tournament.engine.modules.tournament.dto.TournamentGroupStanding> groupStandings = standingsMap.get(groupName);

            if (m.getTeam1() != null) {
                groupStandings.putIfAbsent(m.getTeam1().getId(), createStanding(m.getTeam1(), groupName));
            }
            if (m.getTeam2() != null) {
                groupStandings.putIfAbsent(m.getTeam2().getId(), createStanding(m.getTeam2(), groupName));
            }

            if (m.getStatus() == Match.MatchStatus.COMPLETED) {
                com.tournament.engine.modules.tournament.dto.TournamentGroupStanding st1 = groupStandings.get(m.getTeam1().getId());
                com.tournament.engine.modules.tournament.dto.TournamentGroupStanding st2 = groupStandings.get(m.getTeam2().getId());

                st1.setMatchesPlayed(st1.getMatchesPlayed() + 1);
                st2.setMatchesPlayed(st2.getMatchesPlayed() + 1);
                
                int diff1 = m.getScoreTeam1() - m.getScoreTeam2();
                int diff2 = m.getScoreTeam2() - m.getScoreTeam1();
                
                st1.setRoundDifference(st1.getRoundDifference() + diff1);
                st2.setRoundDifference(st2.getRoundDifference() + diff2);

                if (m.getWinner() != null) {
                    if (m.getWinner().getId().equals(m.getTeam1().getId())) {
                        st1.setWins(st1.getWins() + 1);
                        st1.setPoints(st1.getPoints() + 1);
                        st2.setLosses(st2.getLosses() + 1);
                    } else {
                        st2.setWins(st2.getWins() + 1);
                        st2.setPoints(st2.getPoints() + 1);
                        st1.setLosses(st1.getLosses() + 1);
                    }
                }
            }
        }

        List<com.tournament.engine.modules.tournament.dto.TournamentGroupStanding> result = new ArrayList<>();
        for (Map<Long, com.tournament.engine.modules.tournament.dto.TournamentGroupStanding> map : standingsMap.values()) {
            List<com.tournament.engine.modules.tournament.dto.TournamentGroupStanding> groupList = new ArrayList<>(map.values());
            groupList.sort((a, b) -> {
                if (a.getPoints() != b.getPoints()) return b.getPoints() - a.getPoints();
                return b.getRoundDifference() - a.getRoundDifference();
            });
            result.addAll(groupList);
        }
        return result;
    }

    private com.tournament.engine.modules.tournament.dto.TournamentGroupStanding createStanding(Team team, String groupName) {
        return com.tournament.engine.modules.tournament.dto.TournamentGroupStanding.builder()
                .groupName(groupName)
                .teamId(team.getId())
                .teamName(team.getName())
                .teamTag(team.getTag())
                .logoUrl(team.getLogoUrl())
                .matchesPlayed(0)
                .wins(0)
                .losses(0)
                .points(0)
                .roundDifference(0)
                .build();
    }

    @Override
    @Transactional
    public void advanceToKnockout(Long tournamentId, Long userId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải đấu!"));
        validateOrganizerOrAdmin(tournamentId, userId);

        if (tournament.getStructure() != Tournament.TournamentStructure.GROUP_KNOCKOUT) {
            throw new RuntimeException("Chỉ giải đấu vòng bảng mới cần chốt kết quả vào Knockout!");
        }

        List<com.tournament.engine.modules.tournament.dto.TournamentGroupStanding> standings = getGroupStandings(tournamentId);
        List<Team> groupATop4 = standings.stream().filter(s -> "A".equals(s.getGroupName())).limit(4)
                .map(s -> teamRepository.findById(s.getTeamId()).orElse(null)).filter(Objects::nonNull).collect(Collectors.toList());
        List<Team> groupBTop4 = standings.stream().filter(s -> "B".equals(s.getGroupName())).limit(4)
                .map(s -> teamRepository.findById(s.getTeamId()).orElse(null)).filter(Objects::nonNull).collect(Collectors.toList());

        if (groupATop4.size() < 4 || groupBTop4.size() < 4) {
            throw new RuntimeException("Chưa đủ 4 đội mỗi bảng để chia nhánh đấu Tứ kết!");
        }

        List<Match> knockoutMatches = matchRepository.findByTournamentIdOrderByRoundNumberAscPositionInRoundAsc(tournamentId)
                .stream().filter(m -> m.getStage() == Match.MatchStage.KNOCKOUT && m.getRoundNumber() == 1).collect(Collectors.toList());
        
        if (knockoutMatches.size() < 4) {
            throw new RuntimeException("Lỗi cấu trúc giải đấu: Không tìm thấy 4 trận Tứ kết!");
        }

        Match qf1 = knockoutMatches.get(0);
        qf1.setTeam1(groupATop4.get(0)); // 1A
        qf1.setTeam2(groupBTop4.get(3)); // 4B

        Match qf2 = knockoutMatches.get(1);
        qf2.setTeam1(groupBTop4.get(1)); // 2B
        qf2.setTeam2(groupATop4.get(2)); // 3A

        Match qf3 = knockoutMatches.get(2);
        qf3.setTeam1(groupBTop4.get(0)); // 1B
        qf3.setTeam2(groupATop4.get(3)); // 4A

        Match qf4 = knockoutMatches.get(3);
        qf4.setTeam1(groupATop4.get(1)); // 2A
        qf4.setTeam2(groupBTop4.get(2)); // 3B

        matchRepository.saveAll(knockoutMatches);
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
                .format(match.getFormat() != null ? match.getFormat().name() : null)
                .stage(match.getStage() != null ? match.getStage().name() : null)
                .groupName(match.getGroupName())
                .build();
    }
}
