package com.tournament.engine.modules.tournament.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalTournaments;
    private long pendingTournaments;
    private long totalTeams;

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalTournaments() { return totalTournaments; }
    public void setTotalTournaments(long totalTournaments) { this.totalTournaments = totalTournaments; }

    public long getPendingTournaments() { return pendingTournaments; }
    public void setPendingTournaments(long pendingTournaments) { this.pendingTournaments = pendingTournaments; }

    public long getTotalTeams() { return totalTeams; }
    public void setTotalTeams(long totalTeams) { this.totalTeams = totalTeams; }

    public static DashboardStatsResponseBuilder builder() {
        return new DashboardStatsResponseBuilder();
    }

    public static class DashboardStatsResponseBuilder {
        private long totalUsers;
        private long totalTournaments;
        private long pendingTournaments;
        private long totalTeams;

        public DashboardStatsResponseBuilder totalUsers(long totalUsers) { this.totalUsers = totalUsers; return this; }
        public DashboardStatsResponseBuilder totalTournaments(long totalTournaments) { this.totalTournaments = totalTournaments; return this; }
        public DashboardStatsResponseBuilder pendingTournaments(long pendingTournaments) { this.pendingTournaments = pendingTournaments; return this; }
        public DashboardStatsResponseBuilder totalTeams(long totalTeams) { this.totalTeams = totalTeams; return this; }

        public DashboardStatsResponse build() {
            DashboardStatsResponse obj = new DashboardStatsResponse();
            obj.setTotalUsers(totalUsers);
            obj.setTotalTournaments(totalTournaments);
            obj.setPendingTournaments(pendingTournaments);
            obj.setTotalTeams(totalTeams);
            return obj;
        }
    }
}
