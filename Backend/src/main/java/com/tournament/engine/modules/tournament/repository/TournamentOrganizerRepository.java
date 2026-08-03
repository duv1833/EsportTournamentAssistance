package com.tournament.engine.modules.tournament.repository;

import com.tournament.engine.modules.tournament.model.TournamentOrganizer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentOrganizerRepository extends JpaRepository<TournamentOrganizer, Long> {
    List<TournamentOrganizer> findByTournamentId(Long tournamentId);
    List<TournamentOrganizer> findByUserId(Long userId);
    Optional<TournamentOrganizer> findByTournamentIdAndUserId(Long tournamentId, Long userId);
    boolean existsByTournamentIdAndUserId(Long tournamentId, Long userId);
}
