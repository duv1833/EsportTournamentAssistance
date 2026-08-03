package com.tournament.engine.modules.tournament.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentResponse {
    private Long id;
    private String name;
    private String format;
    private String structure;
    private Integer maxTeams;
    private String rulesDescription;
    private String registrationStatus;
    private String approvalStatus;
    private String startDate;
    private String endDate;
    private String prizePool;
    private String location;
    private Long creatorId;
    private String creatorUsername;
    private List<Long> organizerIds;
    private List<RegisteredTeamDto> registeredTeams;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public String getStructure() { return structure; }
    public void setStructure(String structure) { this.structure = structure; }

    public Integer getMaxTeams() { return maxTeams; }
    public void setMaxTeams(Integer maxTeams) { this.maxTeams = maxTeams; }

    public String getRulesDescription() { return rulesDescription; }
    public void setRulesDescription(String rulesDescription) { this.rulesDescription = rulesDescription; }

    public String getRegistrationStatus() { return registrationStatus; }
    public void setRegistrationStatus(String registrationStatus) { this.registrationStatus = registrationStatus; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getPrizePool() { return prizePool; }
    public void setPrizePool(String prizePool) { this.prizePool = prizePool; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Long getCreatorId() { return creatorId; }
    public void setCreatorId(Long creatorId) { this.creatorId = creatorId; }

    public String getCreatorUsername() { return creatorUsername; }
    public void setCreatorUsername(String creatorUsername) { this.creatorUsername = creatorUsername; }

    public List<Long> getOrganizerIds() { return organizerIds; }
    public void setOrganizerIds(List<Long> organizerIds) { this.organizerIds = organizerIds; }

    public List<RegisteredTeamDto> getRegisteredTeams() { return registeredTeams; }
    public void setRegisteredTeams(List<RegisteredTeamDto> registeredTeams) { this.registeredTeams = registeredTeams; }

    public static TournamentResponseBuilder builder() {
        return new TournamentResponseBuilder();
    }

    public static class TournamentResponseBuilder {
        private Long id;
        private String name;
        private String format;
        private String structure;
        private Integer maxTeams;
        private String rulesDescription;
        private String registrationStatus;
        private String approvalStatus;
        private String startDate;
        private String endDate;
        private String prizePool;
        private String location;
        private Long creatorId;
        private String creatorUsername;
        private List<Long> organizerIds;
        private List<RegisteredTeamDto> registeredTeams;

        public TournamentResponseBuilder id(Long id) { this.id = id; return this; }
        public TournamentResponseBuilder name(String name) { this.name = name; return this; }
        public TournamentResponseBuilder format(String format) { this.format = format; return this; }
        public TournamentResponseBuilder structure(String structure) { this.structure = structure; return this; }
        public TournamentResponseBuilder maxTeams(Integer maxTeams) { this.maxTeams = maxTeams; return this; }
        public TournamentResponseBuilder rulesDescription(String rulesDescription) { this.rulesDescription = rulesDescription; return this; }
        public TournamentResponseBuilder registrationStatus(String registrationStatus) { this.registrationStatus = registrationStatus; return this; }
        public TournamentResponseBuilder approvalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; return this; }
        public TournamentResponseBuilder startDate(String startDate) { this.startDate = startDate; return this; }
        public TournamentResponseBuilder endDate(String endDate) { this.endDate = endDate; return this; }
        public TournamentResponseBuilder prizePool(String prizePool) { this.prizePool = prizePool; return this; }
        public TournamentResponseBuilder location(String location) { this.location = location; return this; }
        public TournamentResponseBuilder creatorId(Long creatorId) { this.creatorId = creatorId; return this; }
        public TournamentResponseBuilder creatorUsername(String creatorUsername) { this.creatorUsername = creatorUsername; return this; }
        public TournamentResponseBuilder organizerIds(List<Long> organizerIds) { this.organizerIds = organizerIds; return this; }
        public TournamentResponseBuilder registeredTeams(List<RegisteredTeamDto> registeredTeams) { this.registeredTeams = registeredTeams; return this; }

        public TournamentResponse build() {
            TournamentResponse obj = new TournamentResponse();
            obj.setId(id);
            obj.setName(name);
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
            obj.setCreatorId(creatorId);
            obj.setCreatorUsername(creatorUsername);
            obj.setOrganizerIds(organizerIds);
            obj.setRegisteredTeams(registeredTeams);
            return obj;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisteredTeamDto {
        private Long id;
        private String name;
        private String tag;
        private String logoUrl;
        private Long captainId;
        private String captainUsername;
        private String captainInGameName;
        private int memberCount;
        private List<TeamMemberResponse> members;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getTag() { return tag; }
        public void setTag(String tag) { this.tag = tag; }

        public String getLogoUrl() { return logoUrl; }
        public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

        public Long getCaptainId() { return captainId; }
        public void setCaptainId(Long captainId) { this.captainId = captainId; }

        public String getCaptainUsername() { return captainUsername; }
        public void setCaptainUsername(String captainUsername) { this.captainUsername = captainUsername; }

        public String getCaptainInGameName() { return captainInGameName; }
        public void setCaptainInGameName(String captainInGameName) { this.captainInGameName = captainInGameName; }

        public int getMemberCount() { return memberCount; }
        public void setMemberCount(int memberCount) { this.memberCount = memberCount; }

        public List<TeamMemberResponse> getMembers() { return members; }
        public void setMembers(List<TeamMemberResponse> members) { this.members = members; }

        public static RegisteredTeamDtoBuilder builder() {
            return new RegisteredTeamDtoBuilder();
        }

        public static class RegisteredTeamDtoBuilder {
            private Long id;
            private String name;
            private String tag;
            private String logoUrl;
            private Long captainId;
            private String captainUsername;
            private String captainInGameName;
            private int memberCount;
            private List<TeamMemberResponse> members;

            public RegisteredTeamDtoBuilder id(Long id) { this.id = id; return this; }
            public RegisteredTeamDtoBuilder name(String name) { this.name = name; return this; }
            public RegisteredTeamDtoBuilder tag(String tag) { this.tag = tag; return this; }
            public RegisteredTeamDtoBuilder logoUrl(String logoUrl) { this.logoUrl = logoUrl; return this; }
            public RegisteredTeamDtoBuilder captainId(Long captainId) { this.captainId = captainId; return this; }
            public RegisteredTeamDtoBuilder captainUsername(String captainUsername) { this.captainUsername = captainUsername; return this; }
            public RegisteredTeamDtoBuilder captainInGameName(String captainInGameName) { this.captainInGameName = captainInGameName; return this; }
            public RegisteredTeamDtoBuilder memberCount(int memberCount) { this.memberCount = memberCount; return this; }
            public RegisteredTeamDtoBuilder members(List<TeamMemberResponse> members) { this.members = members; return this; }

            public RegisteredTeamDto build() {
                RegisteredTeamDto obj = new RegisteredTeamDto();
                obj.setId(id);
                obj.setName(name);
                obj.setTag(tag);
                obj.setLogoUrl(logoUrl);
                obj.setCaptainId(captainId);
                obj.setCaptainUsername(captainUsername);
                obj.setCaptainInGameName(captainInGameName);
                obj.setMemberCount(memberCount);
                obj.setMembers(members);
                return obj;
            }
        }
    }
}
