package com.tournament.engine.modules.tournament.repository;

import com.tournament.engine.modules.tournament.model.TournamentRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentRegistrationRepository extends JpaRepository<TournamentRegistration, Long> {
    List<TournamentRegistration> findByTournamentId(Long tournamentId);
    Optional<TournamentRegistration> findByTournamentIdAndTeamId(Long tournamentId, Long teamId);
    boolean existsByTournamentIdAndTeamId(Long tournamentId, Long teamId);
}
