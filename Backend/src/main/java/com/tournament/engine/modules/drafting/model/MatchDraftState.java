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
}
