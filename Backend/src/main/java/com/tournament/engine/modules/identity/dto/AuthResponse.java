package com.tournament.engine.modules.identity.dto;

import com.tournament.engine.modules.identity.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String nickname;
    private String phoneNumber;
    private String avatarUrl;
    private String displayName;
    private String globalRole;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

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

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String nickname;
        private String phoneNumber;
        private String avatarUrl;
        private String displayName;
        private String globalRole;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder id(Long id) { this.id = id; return this; }
        public AuthResponseBuilder username(String username) { this.username = username; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AuthResponseBuilder nickname(String nickname) { this.nickname = nickname; return this; }
        public AuthResponseBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public AuthResponseBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public AuthResponseBuilder displayName(String displayName) { this.displayName = displayName; return this; }
        public AuthResponseBuilder globalRole(String globalRole) { this.globalRole = globalRole; return this; }

        public AuthResponse build() {
            AuthResponse obj = new AuthResponse();
            obj.setToken(token);
            obj.setId(id);
            obj.setUsername(username);
            obj.setEmail(email);
            obj.setFullName(fullName);
            obj.setNickname(nickname);
            obj.setPhoneNumber(phoneNumber);
            obj.setAvatarUrl(avatarUrl);
            obj.setDisplayName(displayName);
            obj.setGlobalRole(globalRole);
            return obj;
        }
    }
}
