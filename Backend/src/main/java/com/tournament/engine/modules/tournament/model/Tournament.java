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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public MatchFormat getFormat() { return format; }
    public void setFormat(MatchFormat format) { this.format = format; }

    public TournamentStructure getStructure() { return structure; }
    public void setStructure(TournamentStructure structure) { this.structure = structure; }

    public Integer getMaxTeams() { return maxTeams; }
    public void setMaxTeams(Integer maxTeams) { this.maxTeams = maxTeams; }

    public String getRulesDescription() { return rulesDescription; }
    public void setRulesDescription(String rulesDescription) { this.rulesDescription = rulesDescription; }

    public RegistrationStatus getRegistrationStatus() { return registrationStatus; }
    public void setRegistrationStatus(RegistrationStatus registrationStatus) { this.registrationStatus = registrationStatus; }

    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getPrizePool() { return prizePool; }
    public void setPrizePool(String prizePool) { this.prizePool = prizePool; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<TournamentRegistration> getRegistrations() { return registrations; }
    public void setRegistrations(List<TournamentRegistration> registrations) { this.registrations = registrations; }

    public List<TournamentOrganizer> getOrganizers() { return organizers; }
    public void setOrganizers(List<TournamentOrganizer> organizers) { this.organizers = organizers; }

    public static TournamentBuilder builder() {
        return new TournamentBuilder();
    }

    public static class TournamentBuilder {
        private Long id;
        private String name;
        private String description;
        private MatchFormat format;
        private TournamentStructure structure = TournamentStructure.SINGLE_ELIMINATION;
        private Integer maxTeams;
        private String rulesDescription;
        private RegistrationStatus registrationStatus;
        private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String prizePool;
        private String location;
        private String bannerUrl;
        private User creator;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<TournamentRegistration> registrations = new ArrayList<>();
        private List<TournamentOrganizer> organizers = new ArrayList<>();

        public TournamentBuilder id(Long id) { this.id = id; return this; }
        public TournamentBuilder name(String name) { this.name = name; return this; }
        public TournamentBuilder description(String description) { this.description = description; return this; }
        public TournamentBuilder format(MatchFormat format) { this.format = format; return this; }
        public TournamentBuilder structure(TournamentStructure structure) { this.structure = structure; return this; }
        public TournamentBuilder maxTeams(Integer maxTeams) { this.maxTeams = maxTeams; return this; }
        public TournamentBuilder rulesDescription(String rulesDescription) { this.rulesDescription = rulesDescription; return this; }
        public TournamentBuilder registrationStatus(RegistrationStatus registrationStatus) { this.registrationStatus = registrationStatus; return this; }
        public TournamentBuilder approvalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; return this; }
        public TournamentBuilder startDate(LocalDateTime startDate) { this.startDate = startDate; return this; }
        public TournamentBuilder endDate(LocalDateTime endDate) { this.endDate = endDate; return this; }
        public TournamentBuilder prizePool(String prizePool) { this.prizePool = prizePool; return this; }
        public TournamentBuilder location(String location) { this.location = location; return this; }
        public TournamentBuilder bannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; return this; }
        public TournamentBuilder creator(User creator) { this.creator = creator; return this; }
        public TournamentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TournamentBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public TournamentBuilder registrations(List<TournamentRegistration> registrations) { this.registrations = registrations; return this; }
        public TournamentBuilder organizers(List<TournamentOrganizer> organizers) { this.organizers = organizers; return this; }

        public Tournament build() {
            Tournament obj = new Tournament();
            obj.setId(id);
            obj.setName(name);
            obj.setDescription(description);
            obj.setFormat(format);
            obj.setStructure(structure);
            obj.setMaxTeams(maxTeams);
            obj.setRulesDescription(rulesDescription);
            obj.setRegistrationStatus(registrationStatus);
            obj.setApprovalStatus(approvalStatus);
            obj.setStartDate(startDate);
            obj.setEndDate(endDate);
            obj.setPrizePool(prizePool);
            obj.setLocation(location);
            obj.setBannerUrl(bannerUrl);
            obj.setCreator(creator);
            obj.setCreatedAt(createdAt);
            obj.setUpdatedAt(updatedAt);
            obj.setRegistrations(registrations);
            obj.setOrganizers(organizers);
            return obj;
        }
    }
}
