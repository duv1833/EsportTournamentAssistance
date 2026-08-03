package com.tournament.engine.modules.drafting.repository;

import com.tournament.engine.modules.drafting.model.GameMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameMapRepository extends JpaRepository<GameMap, Long> {
    Optional<GameMap> findByName(String name);
    List<GameMap> findByIsActiveTrue();
}
