package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

@Data
public class AddOrganizerRequest {
    private String usernameOrEmail;
    private String role; // REFEREE, CO_ORGANIZER
}
