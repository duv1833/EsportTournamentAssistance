package com.tournament.engine.modules.tournament.service;

import com.tournament.engine.modules.tournament.dto.TeamResponse;

import java.util.List;

public interface TeamService {
    List<TeamResponse> getAllTeams();
    TeamResponse getTeamDetails(Long teamId);
    void joinTeam(Long teamId, com.tournament.engine.modules.tournament.dto.JoinTeamRequest request);
    List<TeamResponse> getTeamsByCaptain(Long captainId);
    void approveJoinRequest(Long teamId, Long memberId, Long captainId);
    void rejectJoinRequest(Long teamId, Long memberId, Long captainId);
    void kickMember(Long teamId, Long memberId, Long captainId);
    
    // Admin features
    void deleteTeam(Long teamId);
}
