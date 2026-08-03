package com.tournament.engine.modules.drafting.repository;

import com.tournament.engine.modules.drafting.model.MatchDraftState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchDraftStateRepository extends JpaRepository<MatchDraftState, Long> {
}
