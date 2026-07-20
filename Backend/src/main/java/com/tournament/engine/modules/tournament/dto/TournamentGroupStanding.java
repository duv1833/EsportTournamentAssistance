package com.tournament.engine.modules.tournament.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TournamentGroupStanding {
    private String groupName;
    private Long teamId;
    private String teamName;
    private String teamTag;
    private String logoUrl;
    
    private int matchesPlayed;
    private int wins;
    private int losses;
    private int points; // e.g. 3 for win, 0 for loss
    private int roundDifference; // scoreTeam1 - scoreTeam2 sum
}
