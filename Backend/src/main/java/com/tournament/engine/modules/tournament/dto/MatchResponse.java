package com.tournament.engine.modules.tournament.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private Long id;
    private Long tournamentId;
    private String tournamentName;
    private Integer roundNumber;
    private Integer positionInRound;

    // Team 1
    private Long team1Id;
    private String team1Name;
    private String team1Tag;
    private String team1LogoUrl;

    // Team 2
    private Long team2Id;
    private String team2Name;
    private String team2Tag;
    private String team2LogoUrl;

    // Score
    private Integer scoreTeam1;
    private Integer scoreTeam2;

    // Winner
    private Long winnerId;
    private String winnerName;

    // Status & Scheduling
    private String status;
    private LocalDateTime scheduledTime;
    private Long nextMatchId;
    private Integer nextMatchSlot;
    private String format;
    private String stage;
    private String groupName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }

    public String getTournamentName() { return tournamentName; }
    public void setTournamentName(String tournamentName) { this.tournamentName = tournamentName; }

    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }

    public Integer getPositionInRound() { return positionInRound; }
    public void setPositionInRound(Integer positionInRound) { this.positionInRound = positionInRound; }

    public Long getTeam1Id() { return team1Id; }
    public void setTeam1Id(Long team1Id) { this.team1Id = team1Id; }

    public String getTeam1Name() { return team1Name; }
    public void setTeam1Name(String team1Name) { this.team1Name = team1Name; }

    public String getTeam1Tag() { return team1Tag; }
    public void setTeam1Tag(String team1Tag) { this.team1Tag = team1Tag; }

    public String getTeam1LogoUrl() { return team1LogoUrl; }
    public void setTeam1LogoUrl(String team1LogoUrl) { this.team1LogoUrl = team1LogoUrl; }

    public Long getTeam2Id() { return team2Id; }
    public void setTeam2Id(Long team2Id) { this.team2Id = team2Id; }

    public String getTeam2Name() { return team2Name; }
    public void setTeam2Name(String team2Name) { this.team2Name = team2Name; }

    public String getTeam2Tag() { return team2Tag; }
    public void setTeam2Tag(String team2Tag) { this.team2Tag = team2Tag; }

    public String getTeam2LogoUrl() { return team2LogoUrl; }
    public void setTeam2LogoUrl(String team2LogoUrl) { this.team2LogoUrl = team2LogoUrl; }

    public Integer getScoreTeam1() { return scoreTeam1; }
    public void setScoreTeam1(Integer scoreTeam1) { this.scoreTeam1 = scoreTeam1; }

    public Integer getScoreTeam2() { return scoreTeam2; }
    public void setScoreTeam2(Integer scoreTeam2) { this.scoreTeam2 = scoreTeam2; }

    public Long getWinnerId() { return winnerId; }
    public void setWinnerId(Long winnerId) { this.winnerId = winnerId; }

    public String getWinnerName() { return winnerName; }
    public void setWinnerName(String winnerName) { this.winnerName = winnerName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }

    public Long getNextMatchId() { return nextMatchId; }
    public void setNextMatchId(Long nextMatchId) { this.nextMatchId = nextMatchId; }

    public Integer getNextMatchSlot() { return nextMatchSlot; }
    public void setNextMatchSlot(Integer nextMatchSlot) { this.nextMatchSlot = nextMatchSlot; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public static MatchResponseBuilder builder() {
        return new MatchResponseBuilder();
    }

    public static class MatchResponseBuilder {
        private Long id;
        private Long tournamentId;
        private String tournamentName;
        private Integer roundNumber;
        private Integer positionInRound;
        private Long team1Id;
        private String team1Name;
        private String team1Tag;
        private String team1LogoUrl;
        private Long team2Id;
        private String team2Name;
        private String team2Tag;
        private String team2LogoUrl;
        private Integer scoreTeam1;
        private Integer scoreTeam2;
        private Long winnerId;
        private String winnerName;
        private String status;
        private LocalDateTime scheduledTime;
        private Long nextMatchId;
        private Integer nextMatchSlot;
        private String format;
        private String stage;
        private String groupName;

        public MatchResponseBuilder id(Long id) { this.id = id; return this; }
        public MatchResponseBuilder tournamentId(Long tournamentId) { this.tournamentId = tournamentId; return this; }
        public MatchResponseBuilder tournamentName(String tournamentName) { this.tournamentName = tournamentName; return this; }
        public MatchResponseBuilder roundNumber(Integer roundNumber) { this.roundNumber = roundNumber; return this; }
        public MatchResponseBuilder positionInRound(Integer positionInRound) { this.positionInRound = positionInRound; return this; }
        public MatchResponseBuilder team1Id(Long team1Id) { this.team1Id = team1Id; return this; }
        public MatchResponseBuilder team1Name(String team1Name) { this.team1Name = team1Name; return this; }
        public MatchResponseBuilder team1Tag(String team1Tag) { this.team1Tag = team1Tag; return this; }
        public MatchResponseBuilder team1LogoUrl(String team1LogoUrl) { this.team1LogoUrl = team1LogoUrl; return this; }
        public MatchResponseBuilder team2Id(Long team2Id) { this.team2Id = team2Id; return this; }
        public MatchResponseBuilder team2Name(String team2Name) { this.team2Name = team2Name; return this; }
        public MatchResponseBuilder team2Tag(String team2Tag) { this.team2Tag = team2Tag; return this; }
        public MatchResponseBuilder team2LogoUrl(String team2LogoUrl) { this.team2LogoUrl = team2LogoUrl; return this; }
        public MatchResponseBuilder scoreTeam1(Integer scoreTeam1) { this.scoreTeam1 = scoreTeam1; return this; }
        public MatchResponseBuilder scoreTeam2(Integer scoreTeam2) { this.scoreTeam2 = scoreTeam2; return this; }
        public MatchResponseBuilder winnerId(Long winnerId) { this.winnerId = winnerId; return this; }
        public MatchResponseBuilder winnerName(String winnerName) { this.winnerName = winnerName; return this; }
        public MatchResponseBuilder status(String status) { this.status = status; return this; }
        public MatchResponseBuilder scheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; return this; }
        public MatchResponseBuilder nextMatchId(Long nextMatchId) { this.nextMatchId = nextMatchId; return this; }
        public MatchResponseBuilder nextMatchSlot(Integer nextMatchSlot) { this.nextMatchSlot = nextMatchSlot; return this; }
        public MatchResponseBuilder format(String format) { this.format = format; return this; }
        public MatchResponseBuilder stage(String stage) { this.stage = stage; return this; }
        public MatchResponseBuilder groupName(String groupName) { this.groupName = groupName; return this; }

        public MatchResponse build() {
            MatchResponse obj = new MatchResponse();
            obj.setId(id);
            obj.setTournamentId(tournamentId);
            obj.setTournamentName(tournamentName);
            obj.setRoundNumber(roundNumber);
            obj.setPositionInRound(positionInRound);
            obj.setTeam1Id(team1Id);
            obj.setTeam1Name(team1Name);
            obj.setTeam1Tag(team1Tag);
            obj.setTeam1LogoUrl(team1LogoUrl);
            obj.setTeam2Id(team2Id);
            obj.setTeam2Name(team2Name);
            obj.setTeam2Tag(team2Tag);
            obj.setTeam2LogoUrl(team2LogoUrl);
            obj.setScoreTeam1(scoreTeam1);
            obj.setScoreTeam2(scoreTeam2);
            obj.setWinnerId(winnerId);
            obj.setWinnerName(winnerName);
            obj.setStatus(status);
            obj.setScheduledTime(scheduledTime);
            obj.setNextMatchId(nextMatchId);
            obj.setNextMatchSlot(nextMatchSlot);
            obj.setFormat(format);
            obj.setStage(stage);
            obj.setGroupName(groupName);
            return obj;
        }
    }
}
