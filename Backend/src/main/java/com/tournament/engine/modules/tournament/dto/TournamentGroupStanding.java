package com.tournament.engine.modules.tournament.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentGroupStanding {
    private String groupName;
    private Long teamId;
    private String teamName;
    private String teamTag;
    private String logoUrl;
    
    private int matchesPlayed;
    private int wins;
    private int losses;
    private int points; // e.g. 3 for win, 0 for loss
    private int roundDifference; // scoreTeam1 - scoreTeam2 sum

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getTeamTag() { return teamTag; }
    public void setTeamTag(String teamTag) { this.teamTag = teamTag; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public int getMatchesPlayed() { return matchesPlayed; }
    public void setMatchesPlayed(int matchesPlayed) { this.matchesPlayed = matchesPlayed; }

    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }

    public int getLosses() { return losses; }
    public void setLosses(int losses) { this.losses = losses; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public int getRoundDifference() { return roundDifference; }
    public void setRoundDifference(int roundDifference) { this.roundDifference = roundDifference; }

    public static TournamentGroupStandingBuilder builder() {
        return new TournamentGroupStandingBuilder();
    }

    public static class TournamentGroupStandingBuilder {
        private String groupName;
        private Long teamId;
        private String teamName;
        private String teamTag;
        private String logoUrl;
        private int matchesPlayed;
        private int wins;
        private int losses;
        private int points;
        private int roundDifference;

        public TournamentGroupStandingBuilder groupName(String groupName) { this.groupName = groupName; return this; }
        public TournamentGroupStandingBuilder teamId(Long teamId) { this.teamId = teamId; return this; }
        public TournamentGroupStandingBuilder teamName(String teamName) { this.teamName = teamName; return this; }
        public TournamentGroupStandingBuilder teamTag(String teamTag) { this.teamTag = teamTag; return this; }
        public TournamentGroupStandingBuilder logoUrl(String logoUrl) { this.logoUrl = logoUrl; return this; }
        public TournamentGroupStandingBuilder matchesPlayed(int matchesPlayed) { this.matchesPlayed = matchesPlayed; return this; }
        public TournamentGroupStandingBuilder wins(int wins) { this.wins = wins; return this; }
        public TournamentGroupStandingBuilder losses(int losses) { this.losses = losses; return this; }
        public TournamentGroupStandingBuilder points(int points) { this.points = points; return this; }
        public TournamentGroupStandingBuilder roundDifference(int roundDifference) { this.roundDifference = roundDifference; return this; }

        public TournamentGroupStanding build() {
            TournamentGroupStanding obj = new TournamentGroupStanding();
            obj.setGroupName(groupName);
            obj.setTeamId(teamId);
            obj.setTeamName(teamName);
            obj.setTeamTag(teamTag);
            obj.setLogoUrl(logoUrl);
            obj.setMatchesPlayed(matchesPlayed);
            obj.setWins(wins);
            obj.setLosses(losses);
            obj.setPoints(points);
            obj.setRoundDifference(roundDifference);
            return obj;
        }
    }
}
