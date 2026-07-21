package com.tournament.engine.modules.drafting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftActionDto {
    private Long id;
    private Integer stepNumber;
    private String phase;
    private String actionType;
    private Long teamId;
    private String teamName;
    private Long userId;
    private String username;
    private String mapName;
    private String agentName;
    private Boolean isAuto;
    private LocalDateTime createdAt;
}
