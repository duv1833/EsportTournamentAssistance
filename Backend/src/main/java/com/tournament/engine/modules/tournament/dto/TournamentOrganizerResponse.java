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
public class TournamentOrganizerResponse {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String role;
    private Long assignedById;
    private String assignedByUsername;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getAssignedById() { return assignedById; }
    public void setAssignedById(Long assignedById) { this.assignedById = assignedById; }

    public String getAssignedByUsername() { return assignedByUsername; }
    public void setAssignedByUsername(String assignedByUsername) { this.assignedByUsername = assignedByUsername; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static TournamentOrganizerResponseBuilder builder() {
        return new TournamentOrganizerResponseBuilder();
    }

    public static class TournamentOrganizerResponseBuilder {
        private Long id;
        private Long userId;
        private String username;
        private String email;
        private String displayName;
        private String avatarUrl;
        private String role;
        private Long assignedById;
        private String assignedByUsername;
        private LocalDateTime createdAt;

        public TournamentOrganizerResponseBuilder id(Long id) { this.id = id; return this; }
        public TournamentOrganizerResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public TournamentOrganizerResponseBuilder username(String username) { this.username = username; return this; }
        public TournamentOrganizerResponseBuilder email(String email) { this.email = email; return this; }
        public TournamentOrganizerResponseBuilder displayName(String displayName) { this.displayName = displayName; return this; }
        public TournamentOrganizerResponseBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public TournamentOrganizerResponseBuilder role(String role) { this.role = role; return this; }
        public TournamentOrganizerResponseBuilder assignedById(Long assignedById) { this.assignedById = assignedById; return this; }
        public TournamentOrganizerResponseBuilder assignedByUsername(String assignedByUsername) { this.assignedByUsername = assignedByUsername; return this; }
        public TournamentOrganizerResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public TournamentOrganizerResponse build() {
            TournamentOrganizerResponse obj = new TournamentOrganizerResponse();
            obj.setId(id);
            obj.setUserId(userId);
            obj.setUsername(username);
            obj.setEmail(email);
            obj.setDisplayName(displayName);
            obj.setAvatarUrl(avatarUrl);
            obj.setRole(role);
            obj.setAssignedById(assignedById);
            obj.setAssignedByUsername(assignedByUsername);
            obj.setCreatedAt(createdAt);
            return obj;
        }
    }
}
