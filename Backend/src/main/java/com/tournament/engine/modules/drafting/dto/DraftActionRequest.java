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
    private String mapName;
    private String selection;

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getMapName() { return mapName; }
    public void setMapName(String mapName) { this.mapName = mapName; }

    public String getSelection() { return selection; }
    public void setSelection(String selection) { this.selection = selection; }
}