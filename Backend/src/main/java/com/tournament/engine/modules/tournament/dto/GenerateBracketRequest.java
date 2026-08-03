package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

@Data
public class GenerateBracketRequest {
    private String earlyRoundsFormat;
    private String semiFinalsFormat;
    private String finalsFormat;
}
