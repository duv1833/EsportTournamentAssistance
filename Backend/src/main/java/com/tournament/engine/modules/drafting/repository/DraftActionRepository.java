package com.tournament.engine.modules.drafting.repository;

import com.tournament.engine.modules.drafting.model.DraftAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DraftActionRepository extends JpaRepository<DraftAction, Long> {
    
    // Tìm lịch sử cấm/chọn của 1 trận đấu, sắp xếp theo lượt (stepNumber)
    List<DraftAction> findByMatchIdOrderByStepNumberAsc(Long matchId);

    // Kiểm tra xem một Tướng (Agent) đã bị cấm hoặc chọn trong trận này chưa
    boolean existsByMatchIdAndAgentId(Long matchId, Long agentId);
}