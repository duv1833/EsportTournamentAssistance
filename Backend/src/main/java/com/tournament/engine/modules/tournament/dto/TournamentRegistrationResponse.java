package com.tournament.engine.modules.tournament.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
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
}
