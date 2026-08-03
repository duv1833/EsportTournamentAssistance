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

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public String getDraftStatus() { return draftStatus; }
    public void setDraftStatus(String draftStatus) { this.draftStatus = draftStatus; }

    public Integer getCurrentStepNumber() { return currentStepNumber; }
    public void setCurrentStepNumber(Integer currentStepNumber) { this.currentStepNumber = currentStepNumber; }

    public Long getCurrentTurnTeamId() { return currentTurnTeamId; }
    public void setCurrentTurnTeamId(Long currentTurnTeamId) { this.currentTurnTeamId = currentTurnTeamId; }

    public LocalDateTime getTurnDeadlineAt() { return turnDeadlineAt; }
    public void setTurnDeadlineAt(LocalDateTime turnDeadlineAt) { this.turnDeadlineAt = turnDeadlineAt; }

    public List<DraftActionDto> getHistory() { return history; }
    public void setHistory(List<DraftActionDto> history) { this.history = history; }

    public static DraftStateResponseBuilder builder() {
        return new DraftStateResponseBuilder();
    }

    public static class DraftStateResponseBuilder {
        private Long matchId;
        private String draftStatus;
        private Integer currentStepNumber;
        private Long currentTurnTeamId;
        private LocalDateTime turnDeadlineAt;
        private List<DraftActionDto> history;

        public DraftStateResponseBuilder matchId(Long matchId) { this.matchId = matchId; return this; }
        public DraftStateResponseBuilder draftStatus(String draftStatus) { this.draftStatus = draftStatus; return this; }
        public DraftStateResponseBuilder currentStepNumber(Integer currentStepNumber) { this.currentStepNumber = currentStepNumber; return this; }
        public DraftStateResponseBuilder currentTurnTeamId(Long currentTurnTeamId) { this.currentTurnTeamId = currentTurnTeamId; return this; }
        public DraftStateResponseBuilder turnDeadlineAt(LocalDateTime turnDeadlineAt) { this.turnDeadlineAt = turnDeadlineAt; return this; }
        public DraftStateResponseBuilder history(List<DraftActionDto> history) { this.history = history; return this; }

        public DraftStateResponse build() {
            DraftStateResponse obj = new DraftStateResponse();
            obj.setMatchId(matchId);
            obj.setDraftStatus(draftStatus);
            obj.setCurrentStepNumber(currentStepNumber);
            obj.setCurrentTurnTeamId(currentTurnTeamId);
            obj.setTurnDeadlineAt(turnDeadlineAt);
            obj.setHistory(history);
            return obj;
        }
    }
}
