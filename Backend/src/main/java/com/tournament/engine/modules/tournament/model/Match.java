package com.tournament.engine.modules.tournament.model;

import com.tournament.engine.modules.identity.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Column(name = "position_in_round", nullable = false)
    private Integer positionInRound;

    @ManyToOne
    @JoinColumn(name = "team1_id")
    private Team team1;

    @ManyToOne
    @JoinColumn(name = "team2_id")
    private Team team2;

    @ManyToOne
    @JoinColumn(name = "winner_team_id")
    private Team winner;

    @ManyToOne
    @JoinColumn(name = "next_match_id")
    private Match nextMatch;

    @Column(name = "next_match_slot")
    private Integer nextMatchSlot; // 1 or 2

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status;

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Column(name = "score_team1", nullable = false)
    @Builder.Default
    private Integer scoreTeam1 = 0;

    @Column(name = "score_team2", nullable = false)
    @Builder.Default
    private Integer scoreTeam2 = 0;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "format")
    private Tournament.MatchFormat format; // Inherit enum from Tournament

    public enum MatchStatus {
        PENDING, DRAFTING, LIVE, COMPLETED, CANCELLED
    }
}
