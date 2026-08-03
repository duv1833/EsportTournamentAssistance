package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

@Data
public class TournamentRegisterRequest {
    private String teamName;
    private String teamTag;
    private Long userId;
    private String captainInGameName;
    private String logoUrl;
    private String captainPhoneNumber;

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getTeamTag() { return teamTag; }
    public void setTeamTag(String teamTag) { this.teamTag = teamTag; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCaptainInGameName() { return captainInGameName; }
    public void setCaptainInGameName(String captainInGameName) { this.captainInGameName = captainInGameName; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getCaptainPhoneNumber() { return captainPhoneNumber; }
    public void setCaptainPhoneNumber(String captainPhoneNumber) { this.captainPhoneNumber = captainPhoneNumber; }
}
