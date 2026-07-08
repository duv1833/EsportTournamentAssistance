package com.tournament.engine.modules.tournament.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tournaments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchFormat format; // BO1, BO3, BO5

    @Column(nullable = false)
    private Integer maxTeams; // 8, 16, 32

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus registrationStatus; // OPEN, LOCKED, IN_PROGRESS

    public enum MatchFormat {
        BO1, BO3, BO5
    }

    public enum RegistrationStatus {
        OPEN, LOCKED, IN_PROGRESS
    }
}
