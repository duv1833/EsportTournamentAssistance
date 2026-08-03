package com.tournament.engine.modules.drafting.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "maps")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameMap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
