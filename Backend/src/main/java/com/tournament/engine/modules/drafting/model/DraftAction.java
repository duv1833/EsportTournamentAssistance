package com.tournament.engine.modules.drafting.model;

import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.tournament.model.Match;
import com.tournament.engine.modules.tournament.model.Team;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "draft_actions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DraftSequenceTemplate.DraftPhase phase; // AGENT, MAP

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private DraftSequenceTemplate.DraftActionType actionType; // BAN, PICK

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "map_id")
    private GameMap map;

    @ManyToOne
    @JoinColumn(name = "agent_id")
    private Agent agent;

    @Column(name = "is_auto", nullable = false)
    @Builder.Default
    private Boolean isAuto = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
