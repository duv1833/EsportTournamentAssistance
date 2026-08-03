package com.tournament.engine.modules.identity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String nickname;
    private String phoneNumber;
    private String avatarUrl;
    private String displayName;
    private String globalRole;
    private Boolean isActive;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getGlobalRole() { return globalRole; }
    public void setGlobalRole(String globalRole) { this.globalRole = globalRole; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public static UserResponseBuilder builder() {
        return new UserResponseBuilder();
    }

    public static class UserResponseBuilder {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String nickname;
        private String phoneNumber;
        private String avatarUrl;
        private String displayName;
        private String globalRole;
        private Boolean isActive;

        public UserResponseBuilder id(Long id) { this.id = id; return this; }
        public UserResponseBuilder username(String username) { this.username = username; return this; }
        public UserResponseBuilder email(String email) { this.email = email; return this; }
        public UserResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserResponseBuilder nickname(String nickname) { this.nickname = nickname; return this; }
        public UserResponseBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public UserResponseBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public UserResponseBuilder displayName(String displayName) { this.displayName = displayName; return this; }
        public UserResponseBuilder globalRole(String globalRole) { this.globalRole = globalRole; return this; }
        public UserResponseBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public UserResponse build() {
            UserResponse obj = new UserResponse();
            obj.setId(id);
            obj.setUsername(username);
            obj.setEmail(email);
            obj.setFullName(fullName);
            obj.setNickname(nickname);
            obj.setPhoneNumber(phoneNumber);
            obj.setAvatarUrl(avatarUrl);
            obj.setDisplayName(displayName);
            obj.setGlobalRole(globalRole);
            obj.setIsActive(isActive);
            return obj;
        }
    }
}
