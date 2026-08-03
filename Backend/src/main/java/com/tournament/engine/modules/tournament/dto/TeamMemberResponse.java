package com.tournament.engine.modules.tournament.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {
    private Long id;
    private Long userId;
    private String username;
    private String inGameName;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getInGameName() { return inGameName; }
    public void setInGameName(String inGameName) { this.inGameName = inGameName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static TeamMemberResponseBuilder builder() {
        return new TeamMemberResponseBuilder();
    }

    public static class TeamMemberResponseBuilder {
        private Long id;
        private Long userId;
        private String username;
        private String inGameName;
        private String status;

        public TeamMemberResponseBuilder id(Long id) { this.id = id; return this; }
        public TeamMemberResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public TeamMemberResponseBuilder username(String username) { this.username = username; return this; }
        public TeamMemberResponseBuilder inGameName(String inGameName) { this.inGameName = inGameName; return this; }
        public TeamMemberResponseBuilder status(String status) { this.status = status; return this; }

        public TeamMemberResponse build() {
            TeamMemberResponse obj = new TeamMemberResponse();
            obj.setId(id);
            obj.setUserId(userId);
            obj.setUsername(username);
            obj.setInGameName(inGameName);
            obj.setStatus(status);
            return obj;
        }
    }
}
