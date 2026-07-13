package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

@Data
public class TournamentRegisterRequest {
    private String teamName;
    private String teamTag;
    private Long userId;
    private String captainInGameName;
}
