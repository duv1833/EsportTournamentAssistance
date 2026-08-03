package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

@Data
public class JoinTeamRequest {
    private Long userId;
    private String inGameName;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getInGameName() { return inGameName; }
    public void setInGameName(String inGameName) { this.inGameName = inGameName; }
}
