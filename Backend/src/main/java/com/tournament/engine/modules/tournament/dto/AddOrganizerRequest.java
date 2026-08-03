package com.tournament.engine.modules.tournament.dto;

import lombok.Data;

@Data
public class AddOrganizerRequest {
    private String usernameOrEmail;
    private String role; // REFEREE, CO_ORGANIZER

    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
