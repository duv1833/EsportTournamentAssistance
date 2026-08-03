package com.tournament.engine.modules.drafting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftActionDto {
    private Long id;
    private Integer stepNumber;
    private String phase;
    private String actionType;
    private Long teamId;
    private String teamName;
    private Long userId;
    private String username;
    private String mapName;
    private String agentName;
    private Boolean isAuto;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getMapName() { return mapName; }
    public void setMapName(String mapName) { this.mapName = mapName; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public Boolean getIsAuto() { return isAuto; }
    public void setIsAuto(Boolean isAuto) { this.isAuto = isAuto; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static DraftActionDtoBuilder builder() {
        return new DraftActionDtoBuilder();
    }

    public static class DraftActionDtoBuilder {
        private Long id;
        private Integer stepNumber;
        private String phase;
        private String actionType;
        private Long teamId;
        private String teamName;
        private Long userId;
        private String username;
        private String mapName;
        private String agentName;
        private Boolean isAuto;
        private LocalDateTime createdAt;

        public DraftActionDtoBuilder id(Long id) { this.id = id; return this; }
        public DraftActionDtoBuilder stepNumber(Integer stepNumber) { this.stepNumber = stepNumber; return this; }
        public DraftActionDtoBuilder phase(String phase) { this.phase = phase; return this; }
        public DraftActionDtoBuilder actionType(String actionType) { this.actionType = actionType; return this; }
        public DraftActionDtoBuilder teamId(Long teamId) { this.teamId = teamId; return this; }
        public DraftActionDtoBuilder teamName(String teamName) { this.teamName = teamName; return this; }
        public DraftActionDtoBuilder userId(Long userId) { this.userId = userId; return this; }
        public DraftActionDtoBuilder username(String username) { this.username = username; return this; }
        public DraftActionDtoBuilder mapName(String mapName) { this.mapName = mapName; return this; }
        public DraftActionDtoBuilder agentName(String agentName) { this.agentName = agentName; return this; }
        public DraftActionDtoBuilder isAuto(Boolean isAuto) { this.isAuto = isAuto; return this; }
        public DraftActionDtoBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public DraftActionDto build() {
            DraftActionDto obj = new DraftActionDto();
            obj.setId(id);
            obj.setStepNumber(stepNumber);
            obj.setPhase(phase);
            obj.setActionType(actionType);
            obj.setTeamId(teamId);
            obj.setTeamName(teamName);
            obj.setUserId(userId);
            obj.setUsername(username);
            obj.setMapName(mapName);
            obj.setAgentName(agentName);
            obj.setIsAuto(isAuto);
            obj.setCreatedAt(createdAt);
            return obj;
        }
    }
}
