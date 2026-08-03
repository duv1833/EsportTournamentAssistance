package com.tournament.engine.modules.drafting.model;

import com.tournament.engine.modules.tournament.model.Match;
import com.tournament.engine.modules.tournament.model.Team;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_draft_states")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchDraftState {

    @Id
    @Column(name = "match_id")
    private Long matchId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "match_id")
    private Match match;

    @Column(name = "current_step_number")
    private Integer currentStepNumber;

    @ManyToOne
    @JoinColumn(name = "current_turn_team_id")
    private Team currentTurnTeam;

    @Column(name = "turn_deadline_at")
    private LocalDateTime turnDeadlineAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "draft_status", nullable = false)
    private DraftStatus draftStatus;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public enum DraftStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED
    }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public Match getMatch() { return match; }
    public void setMatch(Match match) { this.match = match; }

    public Integer getCurrentStepNumber() { return currentStepNumber; }
    public void setCurrentStepNumber(Integer currentStepNumber) { this.currentStepNumber = currentStepNumber; }

    public Team getCurrentTurnTeam() { return currentTurnTeam; }
    public void setCurrentTurnTeam(Team currentTurnTeam) { this.currentTurnTeam = currentTurnTeam; }

    public LocalDateTime getTurnDeadlineAt() { return turnDeadlineAt; }
    public void setTurnDeadlineAt(LocalDateTime turnDeadlineAt) { this.turnDeadlineAt = turnDeadlineAt; }

    public DraftStatus getDraftStatus() { return draftStatus; }
    public void setDraftStatus(DraftStatus draftStatus) { this.draftStatus = draftStatus; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static MatchDraftStateBuilder builder() {
        return new MatchDraftStateBuilder();
    }

    public static class MatchDraftStateBuilder {
        private Long matchId;
        private Match match;
        private Integer currentStepNumber;
        private Team currentTurnTeam;
        private LocalDateTime turnDeadlineAt;
        private DraftStatus draftStatus;
        private LocalDateTime updatedAt;

        public MatchDraftStateBuilder matchId(Long matchId) { this.matchId = matchId; return this; }
        public MatchDraftStateBuilder match(Match match) { this.match = match; return this; }
        public MatchDraftStateBuilder currentStepNumber(Integer currentStepNumber) { this.currentStepNumber = currentStepNumber; return this; }
        public MatchDraftStateBuilder currentTurnTeam(Team currentTurnTeam) { this.currentTurnTeam = currentTurnTeam; return this; }
        public MatchDraftStateBuilder turnDeadlineAt(LocalDateTime turnDeadlineAt) { this.turnDeadlineAt = turnDeadlineAt; return this; }
        public MatchDraftStateBuilder draftStatus(DraftStatus draftStatus) { this.draftStatus = draftStatus; return this; }
        public MatchDraftStateBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public MatchDraftState build() {
            MatchDraftState obj = new MatchDraftState();
            obj.setMatchId(matchId);
            obj.setMatch(match);
            obj.setCurrentStepNumber(currentStepNumber);
            obj.setCurrentTurnTeam(currentTurnTeam);
            obj.setTurnDeadlineAt(turnDeadlineAt);
            obj.setDraftStatus(draftStatus);
            obj.setUpdatedAt(updatedAt);
            return obj;
        }
    }
}
