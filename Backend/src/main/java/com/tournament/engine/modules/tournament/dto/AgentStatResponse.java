package com.tournament.engine.modules.tournament.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentStatResponse {
    private Long agentId;
    private String agentName;
    private String roleType;
    private String imageUrl;
    private int pickCount;
    private int banCount;
    private double pickRate;
    private double banRate;
    private int winCount;
    private double winRate;
}
