package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MatchUpdateRequest {
    private Integer scoreTeam1;
    private Integer scoreTeam2;
    private Long winnerId;
    private String status;
    private LocalDateTime scheduledTime;
}
