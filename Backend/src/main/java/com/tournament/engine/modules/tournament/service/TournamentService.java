package com.tournament.engine.modules.tournament.service;

import com.tournament.engine.modules.tournament.dto.TournamentCreateRequest;
import com.tournament.engine.modules.tournament.dto.TournamentRegisterRequest;
import com.tournament.engine.modules.tournament.dto.TournamentResponse;

import java.util.List;

public interface TournamentService {
    List<TournamentResponse> getAllTournaments();
    TournamentResponse getTournamentDetails(Long id);
    TournamentResponse createTournament(com.tournament.engine.modules.tournament.dto.TournamentCreateRequest request);
    void registerForTournament(Long tournamentId, com.tournament.engine.modules.tournament.dto.TournamentRegisterRequest request);
    
    // Organizer endpoints
    List<com.tournament.engine.modules.tournament.dto.TournamentRegistrationResponse> getTournamentRegistrations(Long tournamentId, Long organizerUserId);
    void approveRegistration(Long tournamentId, Long teamId, Long organizerUserId);
    void rejectRegistration(Long tournamentId, Long teamId, Long organizerUserId);

    // Admin endpoints
    List<TournamentResponse> getAllTournamentsForAdmin(Long adminUserId);
    void approveTournament(Long tournamentId, Long adminUserId);
    void rejectTournament(Long tournamentId, Long adminUserId);
    void updateTournamentByAdmin(Long tournamentId, com.tournament.engine.modules.tournament.dto.TournamentCreateRequest request, Long adminUserId);
    void updateTournament(Long tournamentId, com.tournament.engine.modules.tournament.dto.TournamentCreateRequest request, Long organizerUserId);
    void deleteTournamentByAdmin(Long tournamentId, Long adminUserId);
    // Organizer & Referee management
    List<com.tournament.engine.modules.tournament.dto.TournamentOrganizerResponse> getTournamentOrganizers(Long tournamentId);
    void addTournamentOrganizer(Long tournamentId, com.tournament.engine.modules.tournament.dto.AddOrganizerRequest request, Long assignerUserId);
    void removeTournamentOrganizer(Long tournamentId, Long targetUserId, Long assignerUserId);
}
