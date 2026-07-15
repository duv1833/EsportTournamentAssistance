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

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TeamResponse getTeamDetails(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội tuyển"));
        return mapToResponse(team);
    }

    @Override
    @Transactional(readOnly = true)
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

    private TeamResponse mapToResponse(Team team) {
        List<TeamMemberResponse> memberResponses = team.getMembers().stream()
                .map(m -> TeamMemberResponse.builder()
                        .id(m.getId())
                        .userId(m.getUser().getId())
                        .username(m.getUser().getUsername())
                        .inGameName(m.getInGameName())
                        .status(m.getStatus().name())
                        .build())
                .collect(Collectors.toList());
                
        String captainInGameName = team.getMembers().stream()
                .filter(m -> m.getUser().getId().equals(team.getCaptain().getId()))
                .findFirst()
                .map(TeamMember::getInGameName)
                .orElse(null);

        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .tag(team.getTag())
                .captainId(team.getCaptain().getId())
                .captainUsername(team.getCaptain().getUsername())
                .captainInGameName(captainInGameName)
                .logoUrl(team.getLogoUrl())
                .members(memberResponses)
                .build();
    }
}
