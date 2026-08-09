package com.tournament.engine.modules.tournament.service;

import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.identity.repository.UserRepository;
import com.tournament.engine.modules.tournament.dto.TeamMemberResponse;
import com.tournament.engine.modules.tournament.dto.TeamResponse;
import com.tournament.engine.modules.tournament.model.Team;
import com.tournament.engine.modules.tournament.model.TeamMember;
import com.tournament.engine.modules.tournament.repository.TeamMemberRepository;
import com.tournament.engine.modules.tournament.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.tournament.engine.modules.tournament.model.TournamentRegistration;
import com.tournament.engine.modules.tournament.repository.TournamentRegistrationRepository;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TournamentRegistrationRepository registrationRepository;

    @Override
    @Transactional
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeamResponse getTeamDetails(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội tuyển"));
        return mapToResponse(team);
    }

    @Override
    @Transactional
    public List<TeamResponse> getTeamsByCaptain(Long captainId) {
        return teamRepository.findAll().stream()
                .filter(t -> t.getCaptain().getId().equals(captainId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void joinTeam(Long teamId, com.tournament.engine.modules.tournament.dto.JoinTeamRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội tuyển"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (team.getCaptain().getId().equals(request.getUserId())) {
            throw new RuntimeException("Bạn là đội trưởng của đội này rồi!");
        }

        // Check if user is already part of another team in the same tournament
        java.util.List<com.tournament.engine.modules.tournament.model.TournamentRegistration> teamRegs = team.getRegistrations();
        if (teamRegs != null && !teamRegs.isEmpty()) {
            // Note: Ideally we inject TournamentRegistrationRepository or reuse logic.
            // Since this team is in a tournament, let's just do a naive check if the user is already in another team in this tournament
            boolean userAlreadyInTournament = false;
            for (com.tournament.engine.modules.tournament.model.TournamentRegistration tr : teamRegs.get(0).getTournament().getRegistrations()) {
                Team t = tr.getTeam();
                if (t.getCaptain().getId().equals(user.getId())) {
                    userAlreadyInTournament = true; break;
                }
                if (t.getMembers().stream().anyMatch(m -> m.getUser().getId().equals(user.getId()) && m.getStatus() == TeamMember.MembershipStatus.ACCEPTED)) {
                    userAlreadyInTournament = true; break;
                }
            }
            if (userAlreadyInTournament) {
                throw new RuntimeException("Bạn đã tham gia một đội trong giải đấu này rồi!");
            }
        }

        teamMemberRepository.findByTeamIdAndUserId(teamId, request.getUserId())
                .ifPresent(m -> {
                    throw new RuntimeException("Bạn đã gửi yêu cầu hoặc đã ở trong đội này!");
                });

        TeamMember member = TeamMember.builder()
                .team(team)
                .user(user)
                .inGameName(request.getInGameName())
                .status(TeamMember.MembershipStatus.INVITED)
                .build();
        teamMemberRepository.save(member);
    }

    @Override
    @Transactional
    public void approveJoinRequest(Long teamId, Long memberId, Long captainId) {
        TeamMember member = validateCaptainAndGetMember(teamId, memberId, captainId);

        if (member.getStatus() != TeamMember.MembershipStatus.INVITED) {
            throw new RuntimeException("Yêu cầu này không ở trạng thái chờ duyệt");
        }

        int currentMembersCount = teamMemberRepository.countByTeamIdAndStatus(teamId, TeamMember.MembershipStatus.ACCEPTED);
        
        if (currentMembersCount >= 7) {
            throw new RuntimeException("Đội đã đạt tối đa 7 thành viên");
        }

        member.setStatus(TeamMember.MembershipStatus.ACCEPTED);
        teamMemberRepository.save(member);
    }

    @Override
    @Transactional
    public void rejectJoinRequest(Long teamId, Long memberId, Long captainId) {
        TeamMember member = validateCaptainAndGetMember(teamId, memberId, captainId);
        
        if (member.getStatus() != TeamMember.MembershipStatus.INVITED) {
            throw new RuntimeException("Yêu cầu này không ở trạng thái chờ duyệt");
        }

        member.setStatus(TeamMember.MembershipStatus.REJECTED);
        teamMemberRepository.save(member);
    }

    @Override
    @Transactional
    public void kickMember(Long teamId, Long memberId, Long captainId) {
        TeamMember member = validateCaptainAndGetMember(teamId, memberId, captainId);
        
        if (member.getStatus() != TeamMember.MembershipStatus.ACCEPTED) {
            throw new RuntimeException("Người dùng chưa phải là thành viên chính thức");
        }
        
        if (member.getUser().getId().equals(captainId)) {
            throw new RuntimeException("Không thể đuổi đội trưởng khỏi đội");
        }

        member.setStatus(TeamMember.MembershipStatus.REMOVED);
        teamMemberRepository.save(member);
    }

    @Override
    @Transactional
    public void inviteMember(Long teamId, com.tournament.engine.modules.tournament.dto.InviteMemberRequest request, Long captainId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội tuyển"));

        if (!team.getCaptain().getId().equals(captainId)) {
            throw new RuntimeException("Chỉ đội trưởng mới có quyền mời thành viên!");
        }

        String query = request.getUsernameOrEmail() != null ? request.getUsernameOrEmail().trim() : "";
        if (query.isBlank()) {
            throw new RuntimeException("Vui lòng nhập Username hoặc Email của người chơi!");
        }

        User user = userRepository.findByUsername(query)
                .orElseGet(() -> userRepository.findByEmail(query)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có Username/Email: " + query)));

        if (user.getId().equals(captainId)) {
            throw new RuntimeException("Bạn là đội trưởng của đội này rồi!");
        }

        teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .ifPresent(m -> {
                    throw new RuntimeException("Người dùng " + user.getDisplayName() + " đã nằm trong đội hoặc đã nhận lời mời rồi!");
                });

        int currentMembersCount = teamMemberRepository.countByTeamIdAndStatus(teamId, TeamMember.MembershipStatus.ACCEPTED);
        if (currentMembersCount >= 7) {
            throw new RuntimeException("Đội đã đạt tối đa 7 thành viên!");
        }

        TeamMember member = TeamMember.builder()
                .team(team)
                .user(user)
                .inGameName(request.getInGameName() != null ? request.getInGameName() : user.getUsername())
                .status(TeamMember.MembershipStatus.ACCEPTED) // Captain inviting directly adds them or pending
                .build();
        teamMemberRepository.save(member);
    }

    private Team findTeamByCode(String inviteCode) {
        String code = (inviteCode != null) ? inviteCode.trim() : "";
        java.util.Optional<Team> teamOpt = teamRepository.findByInviteCodeIgnoreCase(code);
        if (teamOpt.isEmpty()) {
            List<Team> allTeams = teamRepository.findAll();
            boolean updated = false;
            for (Team t : allTeams) {
                if (t.getInviteCode() == null || t.getInviteCode().isBlank()) {
                    t.setInviteCode(java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    teamRepository.save(t);
                    updated = true;
                }
            }
            if (updated) {
                teamRepository.flush();
                teamOpt = teamRepository.findByInviteCodeIgnoreCase(code);
            }
        }
        return teamOpt.orElseThrow(() -> new RuntimeException("Mã mời đội tuyển không hợp lệ hoặc không tồn tại!"));
    }

    @Override
    @Transactional
    public TeamResponse getTeamByInviteCode(String inviteCode) {
        Team team = findTeamByCode(inviteCode);
        return mapToResponse(team);
    }

    @Override
    @Transactional
    public void joinTeamByInviteCode(String inviteCode, com.tournament.engine.modules.tournament.dto.JoinTeamRequest request) {
        Team team = findTeamByCode(inviteCode);
        joinTeam(team.getId(), request);
    }

    @Override
    @Transactional
    public void deleteTeam(Long teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new RuntimeException("Không tìm thấy đội tuyển");
        }
        teamRepository.deleteById(teamId);
    }

    private TeamMember validateCaptainAndGetMember(Long teamId, Long memberId, Long captainId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội tuyển"));
                
        if (!team.getCaptain().getId().equals(captainId)) {
            throw new RuntimeException("Chỉ đội trưởng mới có quyền này!");
        }

        return teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu"));
    }

    private TeamResponse mapToResponse(Team targetTeam) {
        if (targetTeam.getInviteCode() == null || targetTeam.getInviteCode().isBlank()) {
            targetTeam.setInviteCode(java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            targetTeam = teamRepository.saveAndFlush(targetTeam);
        }
        final Team team = targetTeam;

        List<TeamMemberResponse> memberResponses = team.getMembers().stream()
                .map(m -> TeamMemberResponse.builder()
                        .id(m.getId())
                        .userId(m.getUser().getId())
                        .username(m.getUser().getDisplayName())
                        .inGameName(m.getInGameName())
                        .status(m.getStatus().name())
                        .build())
                .collect(Collectors.toList());
                
        String captainInGameName = team.getMembers().stream()
                .filter(m -> m.getUser().getId().equals(team.getCaptain().getId()))
                .findFirst()
                .map(TeamMember::getInGameName)
                .orElse(null);

        Long tournamentId = null;
        String tournamentName = null;
        List<TournamentRegistration> regs = registrationRepository.findByTeamId(team.getId());
        if (!regs.isEmpty()) {
            TournamentRegistration reg = regs.get(regs.size() - 1);
            if (reg.getTournament() != null) {
                tournamentId = reg.getTournament().getId();
                tournamentName = reg.getTournament().getName();
            }
        }

        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .tag(team.getTag())
                .captainId(team.getCaptain().getId())
                .captainUsername(team.getCaptain().getDisplayName())
                .captainInGameName(captainInGameName)
                .logoUrl(team.getLogoUrl())
                .inviteCode(team.getInviteCode())
                .tournamentId(tournamentId)
                .tournamentName(tournamentName)
                .members(memberResponses)
                .build();
    }
}
