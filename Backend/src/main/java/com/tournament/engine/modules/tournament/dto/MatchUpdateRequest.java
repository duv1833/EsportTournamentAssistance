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
    
    // Quick fix to save draft actions
    private java.util.List<String> teamAPicks;
    private java.util.List<String> teamABans;
    private java.util.List<String> teamBPicks;
    private java.util.List<String> teamBBans;
}
