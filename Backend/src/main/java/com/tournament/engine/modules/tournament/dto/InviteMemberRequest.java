package com.tournament.engine.modules.tournament.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteMemberRequest {
    private String usernameOrEmail;
    private String inGameName;
}
