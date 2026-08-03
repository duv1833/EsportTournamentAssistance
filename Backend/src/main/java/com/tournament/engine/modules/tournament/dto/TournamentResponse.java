package com.tournament.engine.modules.tournament.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TournamentResponse {
    private Long id;
    private String name;
    private String format;
    private String structure;
    private Integer maxTeams;
    private String rulesDescription;
    private String registrationStatus;
    private String approvalStatus;
    private String startDate;
    private String endDate;
    private String prizePool;
    private String location;
    private Long creatorId;
    private String creatorUsername;
    private List<Long> organizerIds;
    private List<RegisteredTeamDto> registeredTeams;

    @Data
    @Builder
    public static class RegisteredTeamDto {
        private Long id;
        private String name;
        private String tag;
        private String logoUrl;
        private Long captainId;
        private String captainUsername;
        private String captainInGameName;
        private int memberCount;
        private List<TeamMemberResponse> members;
    }
}
