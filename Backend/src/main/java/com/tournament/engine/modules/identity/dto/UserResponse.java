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
}
