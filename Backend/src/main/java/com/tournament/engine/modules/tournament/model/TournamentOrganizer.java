package com.tournament.engine.modules.tournament.model;

import com.tournament.engine.modules.identity.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tournament_organizers", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"tournament_id", "user_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentOrganizer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrganizerRole role;

    @ManyToOne
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum OrganizerRole {
        OWNER, CO_ORGANIZER, REFEREE
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public OrganizerRole getRole() { return role; }
    public void setRole(OrganizerRole role) { this.role = role; }

    public User getAssignedBy() { return assignedBy; }
    public void setAssignedBy(User assignedBy) { this.assignedBy = assignedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static TournamentOrganizerBuilder builder() {
        return new TournamentOrganizerBuilder();
    }

    public static class TournamentOrganizerBuilder {
        private Long id;
        private Tournament tournament;
        private User user;
        private OrganizerRole role;
        private User assignedBy;
        private LocalDateTime createdAt;

        public TournamentOrganizerBuilder id(Long id) { this.id = id; return this; }
        public TournamentOrganizerBuilder tournament(Tournament tournament) { this.tournament = tournament; return this; }
        public TournamentOrganizerBuilder user(User user) { this.user = user; return this; }
        public TournamentOrganizerBuilder role(OrganizerRole role) { this.role = role; return this; }
        public TournamentOrganizerBuilder assignedBy(User assignedBy) { this.assignedBy = assignedBy; return this; }
        public TournamentOrganizerBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public TournamentOrganizer build() {
            TournamentOrganizer obj = new TournamentOrganizer();
            obj.setId(id);
            obj.setTournament(tournament);
            obj.setUser(user);
            obj.setRole(role);
            obj.setAssignedBy(assignedBy);
            obj.setCreatedAt(createdAt);
            return obj;
        }
    }
}
