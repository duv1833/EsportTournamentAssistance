package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

@Data
public class GenerateBracketRequest {
    private String earlyRoundsFormat;
    private String semiFinalsFormat;
    private String finalsFormat;

    public String getEarlyRoundsFormat() { return earlyRoundsFormat; }
    public void setEarlyRoundsFormat(String earlyRoundsFormat) { this.earlyRoundsFormat = earlyRoundsFormat; }

    public String getSemiFinalsFormat() { return semiFinalsFormat; }
    public void setSemiFinalsFormat(String semiFinalsFormat) { this.semiFinalsFormat = semiFinalsFormat; }

    public String getFinalsFormat() { return finalsFormat; }
    public void setFinalsFormat(String finalsFormat) { this.finalsFormat = finalsFormat; }
}
