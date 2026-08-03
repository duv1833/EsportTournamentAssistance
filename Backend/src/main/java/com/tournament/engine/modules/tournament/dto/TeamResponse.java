package com.tournament.engine.modules.tournament.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponse {
    private Long id;
    private String name;
    private String tag;
    private Long captainId;
    private String captainUsername;
    private String captainInGameName;
    private String logoUrl;
    private String inviteCode;
    private List<TeamMemberResponse> members;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public Long getCaptainId() { return captainId; }
    public void setCaptainId(Long captainId) { this.captainId = captainId; }

    public String getCaptainUsername() { return captainUsername; }
    public void setCaptainUsername(String captainUsername) { this.captainUsername = captainUsername; }

    public String getCaptainInGameName() { return captainInGameName; }
    public void setCaptainInGameName(String captainInGameName) { this.captainInGameName = captainInGameName; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getInviteCode() { return inviteCode; }
    public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }

    public List<TeamMemberResponse> getMembers() { return members; }
    public void setMembers(List<TeamMemberResponse> members) { this.members = members; }

    public static TeamResponseBuilder builder() {
        return new TeamResponseBuilder();
    }

    public static class TeamResponseBuilder {
        private Long id;
        private String name;
        private String tag;
        private Long captainId;
        private String captainUsername;
        private String captainInGameName;
        private String logoUrl;
        private String inviteCode;
        private List<TeamMemberResponse> members;

        public TeamResponseBuilder id(Long id) { this.id = id; return this; }
        public TeamResponseBuilder name(String name) { this.name = name; return this; }
        public TeamResponseBuilder tag(String tag) { this.tag = tag; return this; }
        public TeamResponseBuilder captainId(Long captainId) { this.captainId = captainId; return this; }
        public TeamResponseBuilder captainUsername(String captainUsername) { this.captainUsername = captainUsername; return this; }
        public TeamResponseBuilder captainInGameName(String captainInGameName) { this.captainInGameName = captainInGameName; return this; }
        public TeamResponseBuilder logoUrl(String logoUrl) { this.logoUrl = logoUrl; return this; }
        public TeamResponseBuilder inviteCode(String inviteCode) { this.inviteCode = inviteCode; return this; }
        public TeamResponseBuilder members(List<TeamMemberResponse> members) { this.members = members; return this; }

        public TeamResponse build() {
            TeamResponse obj = new TeamResponse();
            obj.setId(id);
            obj.setName(name);
            obj.setTag(tag);
            obj.setCaptainId(captainId);
            obj.setCaptainUsername(captainUsername);
            obj.setCaptainInGameName(captainInGameName);
            obj.setLogoUrl(logoUrl);
            obj.setInviteCode(inviteCode);
            obj.setMembers(members);
            return obj;
        }
    }
}
