package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MatchUpdateRequest {
    private Integer scoreTeam1;
    private Integer scoreTeam2;
    private Long winnerId;
    private String status;
    private LocalDateTime scheduledTime;

    public Integer getScoreTeam1() { return scoreTeam1; }
    public void setScoreTeam1(Integer scoreTeam1) { this.scoreTeam1 = scoreTeam1; }

    public Integer getScoreTeam2() { return scoreTeam2; }
    public void setScoreTeam2(Integer scoreTeam2) { this.scoreTeam2 = scoreTeam2; }

    public Long getWinnerId() { return winnerId; }
    public void setWinnerId(Long winnerId) { this.winnerId = winnerId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }
}
