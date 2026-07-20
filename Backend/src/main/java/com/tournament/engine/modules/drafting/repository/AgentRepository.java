package com.tournament.engine.modules.drafting.repository;

import com.tournament.engine.modules.drafting.model.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
    Optional<Agent> findByName(String name);
    List<Agent> findByIsActiveTrue();
    List<Agent> findByRoleType(String roleType);
}
