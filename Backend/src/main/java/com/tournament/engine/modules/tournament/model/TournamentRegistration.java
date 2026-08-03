package com.tournament.engine.modules.tournament.model;

import com.tournament.engine.modules.identity.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tournament_registrations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status; // PENDING, APPROVED, REJECTED

    @Column(name = "registered_at", insertable = false, updatable = false)
    private LocalDateTime registeredAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    public enum RegistrationStatus {
        PENDING, APPROVED, REJECTED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public RegistrationStatus getStatus() { return status; }
    public void setStatus(RegistrationStatus status) { this.status = status; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }

    public static TournamentRegistrationBuilder builder() {
        return new TournamentRegistrationBuilder();
    }

    public static class TournamentRegistrationBuilder {
        private Long id;
        private Tournament tournament;
        private Team team;
        private RegistrationStatus status;
        private LocalDateTime registeredAt;
        private LocalDateTime reviewedAt;
        private User reviewedBy;

        public TournamentRegistrationBuilder id(Long id) { this.id = id; return this; }
        public TournamentRegistrationBuilder tournament(Tournament tournament) { this.tournament = tournament; return this; }
        public TournamentRegistrationBuilder team(Team team) { this.team = team; return this; }
        public TournamentRegistrationBuilder status(RegistrationStatus status) { this.status = status; return this; }
        public TournamentRegistrationBuilder registeredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; return this; }
        public TournamentRegistrationBuilder reviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; return this; }
        public TournamentRegistrationBuilder reviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; return this; }

        public TournamentRegistration build() {
            TournamentRegistration obj = new TournamentRegistration();
            obj.setId(id);
            obj.setTournament(tournament);
            obj.setTeam(team);
            obj.setStatus(status);
            obj.setRegisteredAt(registeredAt);
            obj.setReviewedAt(reviewedAt);
            obj.setReviewedBy(reviewedBy);
            return obj;
        }
    }
}
