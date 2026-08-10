package com.tournament.engine.modules.identity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLeaderboardDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String nickname;
    private String avatarUrl;
    private String displayName;
    private String globalRole;
    private int rank;
    private int points;
    private int tournamentsCount;
    private int matchesPlayed;
    private int matchesWon;
    private int matchesLost;
    private double winRate;

    public static UserLeaderboardDtoBuilder builder() {
        return new UserLeaderboardDtoBuilder();
    }

    public static class UserLeaderboardDtoBuilder {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String nickname;
        private String avatarUrl;
        private String displayName;
        private String globalRole;
        private int rank;
        private int points;
        private int tournamentsCount;
        private int matchesPlayed;
        private int matchesWon;
        private int matchesLost;
        private double winRate;

        public UserLeaderboardDtoBuilder id(Long id) { this.id = id; return this; }
        public UserLeaderboardDtoBuilder username(String username) { this.username = username; return this; }
        public UserLeaderboardDtoBuilder email(String email) { this.email = email; return this; }
        public UserLeaderboardDtoBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserLeaderboardDtoBuilder nickname(String nickname) { this.nickname = nickname; return this; }
        public UserLeaderboardDtoBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public UserLeaderboardDtoBuilder displayName(String displayName) { this.displayName = displayName; return this; }
        public UserLeaderboardDtoBuilder globalRole(String globalRole) { this.globalRole = globalRole; return this; }
        public UserLeaderboardDtoBuilder rank(int rank) { this.rank = rank; return this; }
        public UserLeaderboardDtoBuilder points(int points) { this.points = points; return this; }
        public UserLeaderboardDtoBuilder tournamentsCount(int tournamentsCount) { this.tournamentsCount = tournamentsCount; return this; }
        public UserLeaderboardDtoBuilder matchesPlayed(int matchesPlayed) { this.matchesPlayed = matchesPlayed; return this; }
        public UserLeaderboardDtoBuilder matchesWon(int matchesWon) { this.matchesWon = matchesWon; return this; }
        public UserLeaderboardDtoBuilder matchesLost(int matchesLost) { this.matchesLost = matchesLost; return this; }
        public UserLeaderboardDtoBuilder winRate(double winRate) { this.winRate = winRate; return this; }

        public UserLeaderboardDto build() {
            UserLeaderboardDto dto = new UserLeaderboardDto();
            dto.setId(id);
            dto.setUsername(username);
            dto.setEmail(email);
            dto.setFullName(fullName);
            dto.setNickname(nickname);
            dto.setAvatarUrl(avatarUrl);
            dto.setDisplayName(displayName);
            dto.setGlobalRole(globalRole);
            dto.setRank(rank);
            dto.setPoints(points);
            dto.setTournamentsCount(tournamentsCount);
            dto.setMatchesPlayed(matchesPlayed);
            dto.setMatchesWon(matchesWon);
            dto.setMatchesLost(matchesLost);
            dto.setWinRate(winRate);
            return dto;
        }
    }
}
