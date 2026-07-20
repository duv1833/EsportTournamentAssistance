package com.tournament.engine.modules.tournament.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
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
}
