package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

@Data
public class TournamentCreateRequest {
    private String name;
    private String format; // BO1, BO3, BO5
    private Integer maxTeams; // 8, 16, 32
    private String rulesDescription;
    private Long creatorId;
}
