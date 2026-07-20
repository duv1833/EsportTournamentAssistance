package com.tournament.engine.modules.drafting.dto;

import lombok.Data;

@Data
public class DraftActionRequest {
    private Long matchId;
    private Long teamId;
    private Long userId;
    private String phase;
    private String actionType;
    private String agentName;
}