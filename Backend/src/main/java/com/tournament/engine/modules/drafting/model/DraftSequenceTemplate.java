package com.tournament.engine.modules.drafting.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "draft_sequence_templates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"format", "step_number"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftSequenceTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String format; // BO1, BO3, BO5

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DraftPhase phase; // AGENT, MAP

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private DraftActionType actionType; // BAN, PICK

    @Column(name = "turn_order", nullable = false)
    private Integer turnOrder; // 1 or 2

    public enum DraftPhase {
        AGENT, MAP
    }

    public enum DraftActionType {
        BAN, PICK
    }
}
