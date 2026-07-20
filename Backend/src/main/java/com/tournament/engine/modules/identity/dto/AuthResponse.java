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
}
