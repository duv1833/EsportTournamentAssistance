package com.tournament.engine.modules.tournament.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentRegistrationResponse {
    private Long id;
    private Long teamId;
    private String teamName;
    private String teamTag;
    private String logoUrl;
    
    // Captain contact info
    private Long captainId;
    private String captainUsername;
    private String captainInGameName;
    private String captainEmail;
    private String captainPhoneNumber;
    
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime registeredAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getTeamTag() { return teamTag; }
    public void setTeamTag(String teamTag) { this.teamTag = teamTag; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public Long getCaptainId() { return captainId; }
    public void setCaptainId(Long captainId) { this.captainId = captainId; }

    public String getCaptainUsername() { return captainUsername; }
    public void setCaptainUsername(String captainUsername) { this.captainUsername = captainUsername; }

    public String getCaptainInGameName() { return captainInGameName; }
    public void setCaptainInGameName(String captainInGameName) { this.captainInGameName = captainInGameName; }

    public String getCaptainEmail() { return captainEmail; }
    public void setCaptainEmail(String captainEmail) { this.captainEmail = captainEmail; }

    public String getCaptainPhoneNumber() { return captainPhoneNumber; }
    public void setCaptainPhoneNumber(String captainPhoneNumber) { this.captainPhoneNumber = captainPhoneNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }

    public static TournamentRegistrationResponseBuilder builder() {
        return new TournamentRegistrationResponseBuilder();
    }

    public static class TournamentRegistrationResponseBuilder {
        private Long id;
        private Long teamId;
        private String teamName;
        private String teamTag;
        private String logoUrl;
        private Long captainId;
        private String captainUsername;
        private String captainInGameName;
        private String captainEmail;
        private String captainPhoneNumber;
        private String status;
        private LocalDateTime registeredAt;

        public TournamentRegistrationResponseBuilder id(Long id) { this.id = id; return this; }
        public TournamentRegistrationResponseBuilder teamId(Long teamId) { this.teamId = teamId; return this; }
        public TournamentRegistrationResponseBuilder teamName(String teamName) { this.teamName = teamName; return this; }
        public TournamentRegistrationResponseBuilder teamTag(String teamTag) { this.teamTag = teamTag; return this; }
        public TournamentRegistrationResponseBuilder logoUrl(String logoUrl) { this.logoUrl = logoUrl; return this; }
        public TournamentRegistrationResponseBuilder captainId(Long captainId) { this.captainId = captainId; return this; }
        public TournamentRegistrationResponseBuilder captainUsername(String captainUsername) { this.captainUsername = captainUsername; return this; }
        public TournamentRegistrationResponseBuilder captainInGameName(String captainInGameName) { this.captainInGameName = captainInGameName; return this; }
        public TournamentRegistrationResponseBuilder captainEmail(String captainEmail) { this.captainEmail = captainEmail; return this; }
        public TournamentRegistrationResponseBuilder captainPhoneNumber(String captainPhoneNumber) { this.captainPhoneNumber = captainPhoneNumber; return this; }
        public TournamentRegistrationResponseBuilder status(String status) { this.status = status; return this; }
        public TournamentRegistrationResponseBuilder registeredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; return this; }

        public TournamentRegistrationResponse build() {
            TournamentRegistrationResponse obj = new TournamentRegistrationResponse();
            obj.setId(id);
            obj.setTeamId(teamId);
            obj.setTeamName(teamName);
            obj.setTeamTag(teamTag);
            obj.setLogoUrl(logoUrl);
            obj.setCaptainId(captainId);
            obj.setCaptainUsername(captainUsername);
            obj.setCaptainInGameName(captainInGameName);
            obj.setCaptainEmail(captainEmail);
            obj.setCaptainPhoneNumber(captainPhoneNumber);
            obj.setStatus(status);
            obj.setRegisteredAt(registeredAt);
            return obj;
        }
    }
}
