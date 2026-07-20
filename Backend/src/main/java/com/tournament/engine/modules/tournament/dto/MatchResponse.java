package com.tournament.engine.modules.tournament.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MatchResponse {
    private Long id;
    private Long tournamentId;
    private String tournamentName;
    private Integer roundNumber;
    private Integer positionInRound;

    // Team 1
    private Long team1Id;
    private String team1Name;
    private String team1Tag;
    private String team1LogoUrl;

    // Team 2
    private Long team2Id;
    private String team2Name;
    private String team2Tag;
    private String team2LogoUrl;

    // Score
    private Integer scoreTeam1;
    private Integer scoreTeam2;

    // Winner
    private Long winnerId;
    private String winnerName;

    // Status & Scheduling
    private String status;
    private LocalDateTime scheduledTime;
    private Long nextMatchId;
    private Integer nextMatchSlot;
    private String format;
    private String stage;
    private String groupName;
}
