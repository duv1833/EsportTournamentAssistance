package com.tournament.engine.modules.tournament.model;

import com.tournament.engine.modules.identity.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tournaments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchFormat format; // BO1, BO3, BO5

    @Enumerated(EnumType.STRING)
    @Column(name = "structure")
    @Builder.Default
    private TournamentStructure structure = TournamentStructure.SINGLE_ELIMINATION;

    @Column(name = "max_teams", nullable = false)
    private Integer maxTeams; // 8, 16, 32

    @Column(name = "rules_description", columnDefinition = "NVARCHAR(MAX)")
    private String rulesDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status", nullable = false)
    private RegistrationStatus registrationStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "prize_pool")
    private String prizePool;

    @Column(name = "location")
    private String location;
    @Column(name = "banner_url")
    private String bannerUrl;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User creator;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public enum MatchFormat {
        BO1, BO3, BO5
    }

    public enum TournamentStructure {
        SINGLE_ELIMINATION, GROUP_KNOCKOUT
    }
    public enum RegistrationStatus {
        OPEN, LOCKED, IN_PROGRESS, COMPLETED, CANCELLED
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TournamentRegistration> registrations = new ArrayList<>();

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TournamentOrganizer> organizers = new ArrayList<>();
}
