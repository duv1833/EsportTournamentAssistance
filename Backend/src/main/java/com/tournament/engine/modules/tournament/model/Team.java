package com.tournament.engine.modules.tournament.model;

import com.tournament.engine.modules.identity.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String tag;

    @ManyToOne
    @JoinColumn(name = "captain_id", nullable = false)
    private User captain;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "invite_code", unique = true)
    private String inviteCode;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TeamMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TournamentRegistration> registrations = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public User getCaptain() { return captain; }
    public void setCaptain(User captain) { this.captain = captain; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getInviteCode() { return inviteCode; }
    public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<TeamMember> getMembers() { return members; }
    public void setMembers(List<TeamMember> members) { this.members = members; }

    public List<TournamentRegistration> getRegistrations() { return registrations; }
    public void setRegistrations(List<TournamentRegistration> registrations) { this.registrations = registrations; }

    public static TeamBuilder builder() {
        return new TeamBuilder();
    }

    public static class TeamBuilder {
        private Long id;
        private String name;
        private String tag;
        private User captain;
        private String logoUrl;
        private String inviteCode;
        private Boolean isActive = true;
        private LocalDateTime createdAt;
        private List<TeamMember> members = new ArrayList<>();
        private List<TournamentRegistration> registrations = new ArrayList<>();

        public TeamBuilder id(Long id) { this.id = id; return this; }
        public TeamBuilder name(String name) { this.name = name; return this; }
        public TeamBuilder tag(String tag) { this.tag = tag; return this; }
        public TeamBuilder captain(User captain) { this.captain = captain; return this; }
        public TeamBuilder logoUrl(String logoUrl) { this.logoUrl = logoUrl; return this; }
        public TeamBuilder inviteCode(String inviteCode) { this.inviteCode = inviteCode; return this; }
        public TeamBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public TeamBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TeamBuilder members(List<TeamMember> members) { this.members = members; return this; }
        public TeamBuilder registrations(List<TournamentRegistration> registrations) { this.registrations = registrations; return this; }

        public Team build() {
            Team obj = new Team();
            obj.setId(id);
            obj.setName(name);
            obj.setTag(tag);
            obj.setCaptain(captain);
            obj.setLogoUrl(logoUrl);
            obj.setInviteCode(inviteCode);
            obj.setIsActive(isActive);
            obj.setCreatedAt(createdAt);
            obj.setMembers(members);
            obj.setRegistrations(registrations);
            return obj;
        }
    }
}
