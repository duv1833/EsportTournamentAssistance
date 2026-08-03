package com.tournament.engine.modules.tournament.model;

import com.tournament.engine.modules.identity.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"team_id", "user_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "in_game_name")
    private String inGameName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MembershipStatus status;

    @Column(name = "invited_at", insertable = false, updatable = false)
    private LocalDateTime invitedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    public enum MembershipStatus {
        INVITED, ACCEPTED, REJECTED, REMOVED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getInGameName() { return inGameName; }
    public void setInGameName(String inGameName) { this.inGameName = inGameName; }

    public MembershipStatus getStatus() { return status; }
    public void setStatus(MembershipStatus status) { this.status = status; }

    public LocalDateTime getInvitedAt() { return invitedAt; }
    public void setInvitedAt(LocalDateTime invitedAt) { this.invitedAt = invitedAt; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }

    public static TeamMemberBuilder builder() {
        return new TeamMemberBuilder();
    }

    public static class TeamMemberBuilder {
        private Long id;
        private Team team;
        private User user;
        private String inGameName;
        private MembershipStatus status;
        private LocalDateTime invitedAt;
        private LocalDateTime respondedAt;

        public TeamMemberBuilder id(Long id) { this.id = id; return this; }
        public TeamMemberBuilder team(Team team) { this.team = team; return this; }
        public TeamMemberBuilder user(User user) { this.user = user; return this; }
        public TeamMemberBuilder inGameName(String inGameName) { this.inGameName = inGameName; return this; }
        public TeamMemberBuilder status(MembershipStatus status) { this.status = status; return this; }
        public TeamMemberBuilder invitedAt(LocalDateTime invitedAt) { this.invitedAt = invitedAt; return this; }
        public TeamMemberBuilder respondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; return this; }

        public TeamMember build() {
            TeamMember obj = new TeamMember();
            obj.setId(id);
            obj.setTeam(team);
            obj.setUser(user);
            obj.setInGameName(inGameName);
            obj.setStatus(status);
            obj.setInvitedAt(invitedAt);
            obj.setRespondedAt(respondedAt);
            return obj;
        }
    }
}
