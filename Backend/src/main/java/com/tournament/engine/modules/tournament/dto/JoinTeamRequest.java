package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

@Data
public class JoinTeamRequest {
    private Long userId;
    private String inGameName;
}
