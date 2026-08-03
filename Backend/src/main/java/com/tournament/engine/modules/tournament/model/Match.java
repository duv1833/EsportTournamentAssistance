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

    @Enumerated(EnumType.STRING)
    @Column(name = "stage")
    private MatchStage stage;

    @Column(name = "group_name")
    private String groupName;

    public enum MatchStatus {
        PENDING, DRAFTING, LIVE, COMPLETED, CANCELLED
    }

    public enum MatchStage {
        GROUP, KNOCKOUT
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }

    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }

    public Integer getPositionInRound() { return positionInRound; }
    public void setPositionInRound(Integer positionInRound) { this.positionInRound = positionInRound; }

    public Team getTeam1() { return team1; }
    public void setTeam1(Team team1) { this.team1 = team1; }

    public Team getTeam2() { return team2; }
    public void setTeam2(Team team2) { this.team2 = team2; }

    public Team getWinner() { return winner; }
    public void setWinner(Team winner) { this.winner = winner; }

    public Match getNextMatch() { return nextMatch; }
    public void setNextMatch(Match nextMatch) { this.nextMatch = nextMatch; }

    public Integer getNextMatchSlot() { return nextMatchSlot; }
    public void setNextMatchSlot(Integer nextMatchSlot) { this.nextMatchSlot = nextMatchSlot; }

    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }

    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }

    public Integer getScoreTeam1() { return scoreTeam1; }
    public void setScoreTeam1(Integer scoreTeam1) { this.scoreTeam1 = scoreTeam1; }

    public Integer getScoreTeam2() { return scoreTeam2; }
    public void setScoreTeam2(Integer scoreTeam2) { this.scoreTeam2 = scoreTeam2; }

    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Tournament.MatchFormat getFormat() { return format; }
    public void setFormat(Tournament.MatchFormat format) { this.format = format; }

    public MatchStage getStage() { return stage; }
    public void setStage(MatchStage stage) { this.stage = stage; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public static MatchBuilder builder() {
        return new MatchBuilder();
    }

    public static class MatchBuilder {
        private Long id;
        private Tournament tournament;
        private Integer roundNumber;
        private Integer positionInRound;
        private Team team1;
        private Team team2;
        private Team winner;
        private Match nextMatch;
        private Integer nextMatchSlot;
        private MatchStatus status;
        private LocalDateTime scheduledTime;
        private Integer scoreTeam1 = 0;
        private Integer scoreTeam2 = 0;
        private Boolean isLocked = false;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Tournament.MatchFormat format;
        private MatchStage stage;
        private String groupName;

        public MatchBuilder id(Long id) { this.id = id; return this; }
        public MatchBuilder tournament(Tournament tournament) { this.tournament = tournament; return this; }
        public MatchBuilder roundNumber(Integer roundNumber) { this.roundNumber = roundNumber; return this; }
        public MatchBuilder positionInRound(Integer positionInRound) { this.positionInRound = positionInRound; return this; }
        public MatchBuilder team1(Team team1) { this.team1 = team1; return this; }
        public MatchBuilder team2(Team team2) { this.team2 = team2; return this; }
        public MatchBuilder winner(Team winner) { this.winner = winner; return this; }
        public MatchBuilder nextMatch(Match nextMatch) { this.nextMatch = nextMatch; return this; }
        public MatchBuilder nextMatchSlot(Integer nextMatchSlot) { this.nextMatchSlot = nextMatchSlot; return this; }
        public MatchBuilder status(MatchStatus status) { this.status = status; return this; }
        public MatchBuilder scheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; return this; }
        public MatchBuilder scoreTeam1(Integer scoreTeam1) { this.scoreTeam1 = scoreTeam1; return this; }
        public MatchBuilder scoreTeam2(Integer scoreTeam2) { this.scoreTeam2 = scoreTeam2; return this; }
        public MatchBuilder isLocked(Boolean isLocked) { this.isLocked = isLocked; return this; }
        public MatchBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public MatchBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public MatchBuilder format(Tournament.MatchFormat format) { this.format = format; return this; }
        public MatchBuilder stage(MatchStage stage) { this.stage = stage; return this; }
        public MatchBuilder groupName(String groupName) { this.groupName = groupName; return this; }

        public Match build() {
            Match obj = new Match();
            obj.setId(id);
            obj.setTournament(tournament);
            obj.setRoundNumber(roundNumber);
            obj.setPositionInRound(positionInRound);
            obj.setTeam1(team1);
            obj.setTeam2(team2);
            obj.setWinner(winner);
            obj.setNextMatch(nextMatch);
            obj.setNextMatchSlot(nextMatchSlot);
            obj.setStatus(status);
            obj.setScheduledTime(scheduledTime);
            obj.setScoreTeam1(scoreTeam1);
            obj.setScoreTeam2(scoreTeam2);
            obj.setIsLocked(isLocked);
            obj.setCreatedAt(createdAt);
            obj.setUpdatedAt(updatedAt);
            obj.setFormat(format);
            obj.setStage(stage);
            obj.setGroupName(groupName);
            return obj;
        }
    }
}
