package com.tournament.engine.modules.tournament.service;

import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.identity.repository.UserRepository;
import com.tournament.engine.modules.tournament.dto.TournamentCreateRequest;
import com.tournament.engine.modules.tournament.dto.TournamentRegisterRequest;
import com.tournament.engine.modules.tournament.dto.TournamentResponse;
import com.tournament.engine.modules.tournament.model.Team;
import com.tournament.engine.modules.tournament.model.TeamMember;
import com.tournament.engine.modules.tournament.model.Tournament;
import com.tournament.engine.modules.tournament.model.TournamentOrganizer;
import com.tournament.engine.modules.tournament.model.TournamentRegistration;
import com.tournament.engine.modules.tournament.repository.TeamRepository;
import com.tournament.engine.modules.tournament.repository.TeamMemberRepository;
import com.tournament.engine.modules.tournament.repository.TournamentOrganizerRepository;
import com.tournament.engine.modules.tournament.repository.TournamentRegistrationRepository;
import com.tournament.engine.modules.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
public class TournamentServiceImpl implements TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final TournamentOrganizerRepository tournamentOrganizerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TournamentResponse> getAllTournaments() {
        return tournamentRepository.findByApprovalStatus(Tournament.ApprovalStatus.APPROVED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TournamentResponse getTournamentDetails(Long id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải đấu!"));
        return mapToResponse(tournament);
    }

    @Override
    @Transactional
    public TournamentResponse createTournament(TournamentCreateRequest request) {
        User creator = userRepository.findById(request.getCreatorId())
                .orElseThrow(() -> new RuntimeException("Người tạo không tồn tại!"));

        Tournament.MatchFormat matchFormat = null;
        if (request.getFormat() != null && !request.getFormat().isBlank()) {
            try {
                matchFormat = Tournament.MatchFormat.valueOf(request.getFormat());
            } catch (IllegalArgumentException ignored) {}
        }

        Tournament tournament = Tournament.builder()
                .name(request.getName())
                .format(matchFormat)
                .maxTeams(request.getMaxTeams())
                .rulesDescription(request.getRulesDescription())
                .prizePool(request.getPrizePool())
                .location(request.getLocation())
                .registrationStatus(Tournament.RegistrationStatus.LOCKED)
                .approvalStatus(Tournament.ApprovalStatus.PENDING)
                .creator(creator)
                .build();
                
        if (request.getStartDate() != null && !request.getStartDate().isBlank()) {
            try {
                tournament.setStartDate(LocalDate.parse(request.getStartDate()).atStartOfDay());
            } catch (DateTimeParseException e) {
                try {
                    tournament.setStartDate(LocalDateTime.parse(request.getStartDate()));
                } catch (DateTimeParseException ignored) {}
            }
        }
        if (request.getEndDate() != null && !request.getEndDate().isBlank()) {
            try {
                tournament.setEndDate(LocalDate.parse(request.getEndDate()).atStartOfDay());
            } catch (DateTimeParseException e) {
                try {
                    tournament.setEndDate(LocalDateTime.parse(request.getEndDate()));
                } catch (DateTimeParseException ignored) {}
            }
        }

        tournament = tournamentRepository.save(tournament);

        // Add creator as OWNER in tournament_organizers
        TournamentOrganizer organizer = TournamentOrganizer.builder()
                .tournament(tournament)
                .user(creator)
                .role(TournamentOrganizer.OrganizerRole.OWNER)
                .build();
        tournamentOrganizerRepository.save(organizer);

        return mapToResponse(tournament);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TournamentResponse> getAllTournamentsForAdmin(Long adminUserId) {
        validateAdmin(adminUserId);
        return tournamentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void approveTournament(Long tournamentId, Long adminUserId) {
        validateAdmin(adminUserId);
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải đấu!"));
        
        tournament.setApprovalStatus(Tournament.ApprovalStatus.APPROVED);
        tournament.setRegistrationStatus(Tournament.RegistrationStatus.OPEN);
        tournamentRepository.save(tournament);
    }

    @Override
    @Transactional
    public void rejectTournament(Long tournamentId, Long adminUserId) {
        deleteTournamentByAdmin(tournamentId, adminUserId);
    }

    @Override
    @Transactional
    public void updateTournamentByAdmin(Long tournamentId, TournamentCreateRequest request, Long adminUserId) {
        validateAdmin(adminUserId);
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải đấu!"));

        if (request.getName() != null && !request.getName().isBlank()) {
            tournament.setName(request.getName());
        }
        if (request.getFormat() != null) {
            tournament.setFormat(Tournament.MatchFormat.valueOf(request.getFormat()));
        }
        if (request.getMaxTeams() != null && request.getMaxTeams() > 0) {
            tournament.setMaxTeams(request.getMaxTeams());
        }
        if (request.getRulesDescription() != null) {
            tournament.setRulesDescription(request.getRulesDescription());
        }
        if (request.getPrizePool() != null) {
            tournament.setPrizePool(request.getPrizePool());
        }
        if (request.getLocation() != null) {
            tournament.setLocation(request.getLocation());
        }
        if (request.getStartDate() != null && !request.getStartDate().isBlank()) {
            try {
                tournament.setStartDate(LocalDate.parse(request.getStartDate()).atStartOfDay());
            } catch (DateTimeParseException e) {
                try {
                    tournament.setStartDate(LocalDateTime.parse(request.getStartDate()));
                } catch (DateTimeParseException ignored) {}
            }
        }
        if (request.getEndDate() != null && !request.getEndDate().isBlank()) {
            try {
                tournament.setEndDate(LocalDate.parse(request.getEndDate()).atStartOfDay());
            } catch (DateTimeParseException e) {
                try {
                    tournament.setEndDate(LocalDateTime.parse(request.getEndDate()));
                } catch (DateTimeParseException ignored) {}
            }
        }

        tournamentRepository.save(tournament);
    }

    @Override
    @Transactional
    public void updateTournament(Long tournamentId, TournamentCreateRequest request, Long organizerUserId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải đấu!"));

        if (!tournament.getCreator().getId().equals(organizerUserId)) {
            User user = userRepository.findById(organizerUserId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
            if (user.getGlobalRole() != User.GlobalRole.ADMIN) {
                throw new RuntimeException("Bạn không có quyền chỉnh sửa giải đấu này!");
            }
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            tournament.setName(request.getName());
        }
        if (request.getFormat() != null) {
            tournament.setFormat(Tournament.MatchFormat.valueOf(request.getFormat()));
        }
        if (request.getMaxTeams() != null && request.getMaxTeams() > 0) {
            tournament.setMaxTeams(request.getMaxTeams());
        }
        if (request.getRulesDescription() != null) {
            tournament.setRulesDescription(request.getRulesDescription());
        }
        if (request.getPrizePool() != null) {
            tournament.setPrizePool(request.getPrizePool());
        }
        if (request.getLocation() != null) {
            tournament.setLocation(request.getLocation());
        }
        if (request.getStartDate() != null && !request.getStartDate().isBlank()) {
            try {
                tournament.setStartDate(LocalDate.parse(request.getStartDate()).atStartOfDay());
            } catch (DateTimeParseException e) {
                try {
                    tournament.setStartDate(LocalDateTime.parse(request.getStartDate()));
                } catch (DateTimeParseException ignored) {}
            }
        }
        if (request.getEndDate() != null && !request.getEndDate().isBlank()) {
            try {
                tournament.setEndDate(LocalDate.parse(request.getEndDate()).atStartOfDay());
            } catch (DateTimeParseException e) {
                try {
                    tournament.setEndDate(LocalDateTime.parse(request.getEndDate()));
                } catch (DateTimeParseException ignored) {}
            }
        }

        tournamentRepository.save(tournament);
    }

    @Override
    @Transactional
    public void deleteTournamentByAdmin(Long tournamentId, Long adminUserId) {
        validateAdmin(adminUserId);
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải đấu!"));

        // Delete all registrations for this tournament
        List<TournamentRegistration> registrations = registrationRepository.findByTournamentId(tournamentId);
        registrationRepository.deleteAll(registrations);

        // Delete all organizers for this tournament
        List<TournamentOrganizer> organizers = tournamentOrganizerRepository.findByTournamentId(tournamentId);
        tournamentOrganizerRepository.deleteAll(organizers);

        // Delete the tournament
        tournamentRepository.delete(tournament);
    }

    private void validateAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        if (user.getGlobalRole() != User.GlobalRole.ADMIN) {
            throw new RuntimeException("Bạn không có quyền thực hiện thao tác này (Chỉ dành cho Admin)!");
        }
    }

    @Override
    @Transactional
    public void registerForTournament(Long tournamentId, TournamentRegisterRequest request) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải đấu!"));

        if (tournament.getRegistrationStatus() != Tournament.RegistrationStatus.OPEN) {
            throw new RuntimeException("Giải đấu đã khóa hoặc không còn nhận đăng ký!");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // Check total registrations limit first
        List<TournamentRegistration> registrations = registrationRepository.findByTournamentId(tournamentId);
        if (registrations.size() >= tournament.getMaxTeams()) {
            throw new RuntimeException("Giải đấu đã đạt số lượng đội tuyển tối đa!");
        }

        // Check if user is already part of a team in this tournament
        Optional<TournamentRegistration> userRegOpt = registrations.stream().filter(r -> {
            Team t = r.getTeam();
            if (t.getCaptain().getId().equals(user.getId())) return true;
            return t.getMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(user.getId()) && 
                            (m.getStatus() == TeamMember.MembershipStatus.ACCEPTED || m.getStatus() == TeamMember.MembershipStatus.INVITED));
        }).findFirst();

        if (userRegOpt.isPresent()) {
            String teamName = userRegOpt.get().getTeam().getName();
            throw new RuntimeException("Bạn đã tạo hoặc đang trong đội tuyển [" + teamName + "] ở trong giải đấu này rồi!");
        }

        // Update captain phone number if provided
        if (request.getCaptainPhoneNumber() != null && !request.getCaptainPhoneNumber().isBlank()) {
            user.setPhoneNumber(request.getCaptainPhoneNumber());
            userRepository.save(user);
        }

        // Find or create team
        Optional<Team> existingTeamOpt = teamRepository.findByName(request.getTeamName());
        Team team;
        if (existingTeamOpt.isPresent()) {
            team = existingTeamOpt.get();
            if (!team.getCaptain().getId().equals(user.getId())) {
                throw new RuntimeException("Tên đội tuyển này đã được đăng ký bởi người khác!");
            }
            if (request.getLogoUrl() != null && !request.getLogoUrl().isBlank()) {
                team.setLogoUrl(request.getLogoUrl());
                teamRepository.save(team);
            }
        } else {
            team = Team.builder()
                    .name(request.getTeamName())
                    .tag(request.getTeamTag())
                    .logoUrl(request.getLogoUrl())
                    .captain(user)
                    .isActive(true)
                    .build();
            team = teamRepository.save(team);
            
            // Add captain as a TeamMember
            TeamMember captainMember = TeamMember.builder()
                    .team(team)
                    .user(user)
                    .inGameName(request.getCaptainInGameName())
                    .status(TeamMember.MembershipStatus.ACCEPTED)
                    .build();
            teamMemberRepository.save(captainMember);
        }

        // Check if team already registered
        if (registrationRepository.existsByTournamentIdAndTeamId(tournamentId, team.getId())) {
            throw new RuntimeException("Đội tuyển của bạn đã đăng ký tham gia giải đấu này rồi!");
        }

        // Save registration as PENDING for organizer to review
        TournamentRegistration registration = TournamentRegistration.builder()
                .tournament(tournament)
                .team(team)
                .status(TournamentRegistration.RegistrationStatus.PENDING)
                .build();

        registrationRepository.save(registration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.tournament.engine.modules.tournament.dto.TournamentRegistrationResponse> getTournamentRegistrations(Long tournamentId, Long organizerUserId) {
        validateOrganizer(tournamentId, organizerUserId);
        
        List<TournamentRegistration> registrations = registrationRepository.findByTournamentId(tournamentId);
        
        return registrations.stream().map(reg -> {
            Team team = reg.getTeam();
            User captain = team.getCaptain();
            
            String captainInGameName = team.getMembers().stream()
                    .filter(m -> m.getUser().getId().equals(captain.getId()))
                    .findFirst()
                    .map(TeamMember::getInGameName)
                    .orElse(null);
                    
            return com.tournament.engine.modules.tournament.dto.TournamentRegistrationResponse.builder()
                    .id(reg.getId())
                    .teamId(team.getId())
                    .teamName(team.getName())
                    .teamTag(team.getTag())
                    .logoUrl(team.getLogoUrl())
                    .captainId(captain.getId())
                    .captainUsername(captain.getUsername())
                    .captainInGameName(captainInGameName)
                    .captainEmail(captain.getEmail())
                    .captainPhoneNumber(captain.getPhoneNumber())
                    .status(reg.getStatus().name())
                    .registeredAt(reg.getRegisteredAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void approveRegistration(Long tournamentId, Long teamId, Long organizerUserId) {
        validateOrganizer(tournamentId, organizerUserId);
        
        TournamentRegistration registration = registrationRepository.findByTournamentIdAndTeamId(tournamentId, teamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));
                
        if (registration.getStatus() != TournamentRegistration.RegistrationStatus.PENDING) {
            throw new RuntimeException("Đội này không ở trạng thái chờ duyệt");
        }
        
        registration.setStatus(TournamentRegistration.RegistrationStatus.APPROVED);
        registration.setReviewedAt(java.time.LocalDateTime.now());
        registration.setReviewedBy(userRepository.findById(organizerUserId).orElse(null));
        
        registrationRepository.save(registration);
    }

    @Override
    @Transactional
    public void rejectRegistration(Long tournamentId, Long teamId, Long organizerUserId) {
        validateOrganizer(tournamentId, organizerUserId);
        
        TournamentRegistration registration = registrationRepository.findByTournamentIdAndTeamId(tournamentId, teamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));
                
        if (registration.getStatus() != TournamentRegistration.RegistrationStatus.PENDING) {
            throw new RuntimeException("Đội này không ở trạng thái chờ duyệt");
        }
        
        registration.setStatus(TournamentRegistration.RegistrationStatus.REJECTED);
        registration.setReviewedAt(java.time.LocalDateTime.now());
        registration.setReviewedBy(userRepository.findById(organizerUserId).orElse(null));
        
        registrationRepository.save(registration);
    }
    
    private void validateOrganizer(Long tournamentId, Long userId) {
        if (!tournamentOrganizerRepository.existsByTournamentIdAndUserId(tournamentId, userId)) {
            // Also allow system ADMIN
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            if (user.getGlobalRole() != User.GlobalRole.ADMIN) {
                throw new RuntimeException("Bạn không có quyền quản lý giải đấu này");
            }
        }
    }

    private TournamentResponse mapToResponse(Tournament tournament) {
        List<TournamentRegistration> registrations = registrationRepository.findByTournamentId(tournament.getId());
        List<TournamentResponse.RegisteredTeamDto> registeredTeams = registrations.stream()
                .filter(r -> r.getStatus() == TournamentRegistration.RegistrationStatus.APPROVED)
                .map(r -> {
                    Team team = r.getTeam();
                    int approvedMembers = (int) team.getMembers().stream()
                            .filter(m -> m.getStatus() == TeamMember.MembershipStatus.ACCEPTED)
                            .count();
                    
                    String captainInGameName = team.getMembers().stream()
                            .filter(m -> m.getUser().getId().equals(team.getCaptain().getId()))
                            .findFirst()
                            .map(TeamMember::getInGameName)
                            .orElse(null);
                            
                    List<com.tournament.engine.modules.tournament.dto.TeamMemberResponse> memberResponses = team.getMembers().stream()
                            .map(m -> com.tournament.engine.modules.tournament.dto.TeamMemberResponse.builder()
                                    .id(m.getId())
                                    .userId(m.getUser().getId())
                                    .username(m.getUser().getDisplayName())
                                    .inGameName(m.getInGameName())
                                    .status(m.getStatus().name())
                                    .build())
                            .collect(Collectors.toList());
                            
                    return TournamentResponse.RegisteredTeamDto.builder()
                            .id(team.getId())
                            .name(team.getName())
                            .tag(team.getTag())
                            .logoUrl(team.getLogoUrl())
                            .captainId(team.getCaptain().getId())
                            .captainUsername(team.getCaptain().getDisplayName())
                            .captainInGameName(captainInGameName)
                            .memberCount(approvedMembers) // Since captain is now in members, just count all ACCEPTED members
                            .members(memberResponses)
                            .build();
                })
                .collect(Collectors.toList());

        return TournamentResponse.builder()
                .id(tournament.getId())
                .name(tournament.getName())
                .format(tournament.getFormat() != null ? tournament.getFormat().name() : null)
                .maxTeams(tournament.getMaxTeams())
                .rulesDescription(tournament.getRulesDescription())
                .registrationStatus(tournament.getRegistrationStatus().name())
                .approvalStatus(tournament.getApprovalStatus() != null ? tournament.getApprovalStatus().name() : "PENDING")
                .startDate(tournament.getStartDate() != null ? tournament.getStartDate().toString() : null)
                .endDate(tournament.getEndDate() != null ? tournament.getEndDate().toString() : null)
                .prizePool(tournament.getPrizePool())
                .location(tournament.getLocation())
                .creatorId(tournament.getCreator().getId())
                .creatorUsername(tournament.getCreator().getDisplayName())
                .registeredTeams(registeredTeams)
                .build();
    }
}
