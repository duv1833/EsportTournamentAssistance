package com.tournament.engine.modules.tournament.model;

import com.tournament.engine.modules.identity.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_audit_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private AuditActionType actionType;

    @Column(name = "old_value", columnDefinition = "NVARCHAR(MAX)")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "NVARCHAR(MAX)")
    private String newValue;

    @Column(length = 500)
    private String reason;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum AuditActionType {
        SCORE_SUBMIT, SCORE_CORRECTION, ROLLBACK
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Match getMatch() { return match; }
    public void setMatch(Match match) { this.match = match; }

    public User getPerformedBy() { return performedBy; }
    public void setPerformedBy(User performedBy) { this.performedBy = performedBy; }

    public AuditActionType getActionType() { return actionType; }
    public void setActionType(AuditActionType actionType) { this.actionType = actionType; }

    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }

    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static MatchAuditLogBuilder builder() {
        return new MatchAuditLogBuilder();
    }

    public static class MatchAuditLogBuilder {
        private Long id;
        private Match match;
        private User performedBy;
        private AuditActionType actionType;
        private String oldValue;
        private String newValue;
        private String reason;
        private LocalDateTime createdAt;

        public MatchAuditLogBuilder id(Long id) { this.id = id; return this; }
        public MatchAuditLogBuilder match(Match match) { this.match = match; return this; }
        public MatchAuditLogBuilder performedBy(User performedBy) { this.performedBy = performedBy; return this; }
        public MatchAuditLogBuilder actionType(AuditActionType actionType) { this.actionType = actionType; return this; }
        public MatchAuditLogBuilder oldValue(String oldValue) { this.oldValue = oldValue; return this; }
        public MatchAuditLogBuilder newValue(String newValue) { this.newValue = newValue; return this; }
        public MatchAuditLogBuilder reason(String reason) { this.reason = reason; return this; }
        public MatchAuditLogBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public MatchAuditLog build() {
            MatchAuditLog obj = new MatchAuditLog();
            obj.setId(id);
            obj.setMatch(match);
            obj.setPerformedBy(performedBy);
            obj.setActionType(actionType);
            obj.setOldValue(oldValue);
            obj.setNewValue(newValue);
            obj.setReason(reason);
            obj.setCreatedAt(createdAt);
            return obj;
        }
    }
}
