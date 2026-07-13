package com.tournament.engine.modules.tournament.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TeamResponse {
    private Long id;
    private String name;
    private String tag;
    private Long captainId;
    private String captainUsername;
    private String captainInGameName;
    private String logoUrl;
    private List<TeamMemberResponse> members;
}
