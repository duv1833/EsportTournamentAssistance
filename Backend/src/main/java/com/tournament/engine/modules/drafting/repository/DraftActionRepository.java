package com.tournament.engine.modules.drafting.repository;

import com.tournament.engine.modules.drafting.model.DraftAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DraftActionRepository extends JpaRepository<DraftAction, Long> {
    List<DraftAction> findByMatchIdOrderByStepNumberAsc(Long matchId);
}
