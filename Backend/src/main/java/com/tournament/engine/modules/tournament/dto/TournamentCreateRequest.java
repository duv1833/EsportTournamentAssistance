package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

@Data
public class TournamentCreateRequest {
    private String name;
    private String format; // BO1, BO3, BO5
    private String structure; // SINGLE_ELIMINATION, GROUP_KNOCKOUT
    private Integer maxTeams; // 8, 16, 32
    private String rulesDescription;
    private String startDate;
    private String endDate;
    private String prizePool;
    private String location;
    private Long creatorId;
}
