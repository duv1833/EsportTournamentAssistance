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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public DraftPhase getPhase() { return phase; }
    public void setPhase(DraftPhase phase) { this.phase = phase; }

    public DraftActionType getActionType() { return actionType; }
    public void setActionType(DraftActionType actionType) { this.actionType = actionType; }

    public Integer getTurnOrder() { return turnOrder; }
    public void setTurnOrder(Integer turnOrder) { this.turnOrder = turnOrder; }
}
