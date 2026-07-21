package com.tournament.engine.modules.drafting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftStateResponse {
    private Long matchId;
    private String draftStatus;
    private Integer currentStepNumber;
    private Long currentTurnTeamId;
    private LocalDateTime turnDeadlineAt;
    private List<DraftActionDto> history;
}
