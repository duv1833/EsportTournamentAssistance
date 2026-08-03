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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Match getMatch() { return match; }
    public void setMatch(Match match) { this.match = match; }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public DraftSequenceTemplate.DraftPhase getPhase() { return phase; }
    public void setPhase(DraftSequenceTemplate.DraftPhase phase) { this.phase = phase; }

    public DraftSequenceTemplate.DraftActionType getActionType() { return actionType; }
    public void setActionType(DraftSequenceTemplate.DraftActionType actionType) { this.actionType = actionType; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public GameMap getMap() { return map; }
    public void setMap(GameMap map) { this.map = map; }

    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }

    public Boolean getIsAuto() { return isAuto; }
    public void setIsAuto(Boolean isAuto) { this.isAuto = isAuto; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static DraftActionBuilder builder() {
        return new DraftActionBuilder();
    }

    public static class DraftActionBuilder {
        private Long id;
        private Match match;
        private Integer stepNumber;
        private DraftSequenceTemplate.DraftPhase phase;
        private DraftSequenceTemplate.DraftActionType actionType;
        private Team team;
        private User user;
        private GameMap map;
        private Agent agent;
        private Boolean isAuto = false;
        private LocalDateTime createdAt;

        public DraftActionBuilder id(Long id) { this.id = id; return this; }
        public DraftActionBuilder match(Match match) { this.match = match; return this; }
        public DraftActionBuilder stepNumber(Integer stepNumber) { this.stepNumber = stepNumber; return this; }
        public DraftActionBuilder phase(DraftSequenceTemplate.DraftPhase phase) { this.phase = phase; return this; }
        public DraftActionBuilder actionType(DraftSequenceTemplate.DraftActionType actionType) { this.actionType = actionType; return this; }
        public DraftActionBuilder team(Team team) { this.team = team; return this; }
        public DraftActionBuilder user(User user) { this.user = user; return this; }
        public DraftActionBuilder map(GameMap map) { this.map = map; return this; }
        public DraftActionBuilder agent(Agent agent) { this.agent = agent; return this; }
        public DraftActionBuilder isAuto(Boolean isAuto) { this.isAuto = isAuto; return this; }
        public DraftActionBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public DraftAction build() {
            DraftAction obj = new DraftAction();
            obj.setId(id);
            obj.setMatch(match);
            obj.setStepNumber(stepNumber);
            obj.setPhase(phase);
            obj.setActionType(actionType);
            obj.setTeam(team);
            obj.setUser(user);
            obj.setMap(map);
            obj.setAgent(agent);
            obj.setIsAuto(isAuto);
            obj.setCreatedAt(createdAt);
            return obj;
        }
    }
}
