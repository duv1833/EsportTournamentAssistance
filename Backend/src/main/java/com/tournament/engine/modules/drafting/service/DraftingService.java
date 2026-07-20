package com.tournament.engine.modules.drafting.service;

import com.tournament.engine.modules.drafting.dto.DraftActionRequest;
import com.tournament.engine.modules.drafting.model.Agent;
import com.tournament.engine.modules.drafting.model.DraftAction;
import com.tournament.engine.modules.drafting.model.DraftSequenceTemplate;
import com.tournament.engine.modules.drafting.model.MatchDraftState;
import com.tournament.engine.modules.drafting.repository.AgentRepository;
import com.tournament.engine.modules.drafting.repository.DraftActionRepository;
import com.tournament.engine.modules.drafting.repository.MatchDraftStateRepository;
import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DraftingService {

    private final DraftActionRepository draftActionRepository;
    private final MatchDraftStateRepository matchDraftStateRepository;
    private final AgentRepository agentRepository;
    private final UserRepository userRepository;

    @Transactional
    public String processAction(DraftActionRequest request) {
        // 1. Kiểm tra xem ván đấu có tồn tại trong bảng match_draft_states không
        MatchDraftState draftState = matchDraftStateRepository.findById(request.getMatchId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạng thái Draft cho Ván " + request.getMatchId()));

        // 2. Validate Bảo mật: Có đúng là lượt của Đội này không?
        if (!draftState.getCurrentTurnTeam().getId().equals(request.getTeamId())) {
            throw new RuntimeException("LỖI BẢO MẬT: Chưa tới lượt của đội " + request.getTeamId());
        }

        // 3. Tìm Tướng (Agent) và Người thao tác (User) trong DB
        Agent agent = agentRepository.findByName(request.getAgentName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Đặc vụ: " + request.getAgentName()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản thao tác!"));

        // 4. Validate Logic: Check xem tướng này đã bị cấm/chọn trong ván này chưa (Đã sửa tên hàm)
        if (draftActionRepository.existsByMatchIdAndAgentId(request.getMatchId(), agent.getId())) {
            throw new RuntimeException("Tướng " + agent.getName() + " đã bị cấm hoặc chọn rồi!");
        }

        // 5. Khởi tạo và Lưu lịch sử hành động (Draft Action)
        DraftAction newAction = DraftAction.builder()
                .match(draftState.getMatch())
                .team(draftState.getCurrentTurnTeam())
                .user(user)
                .agent(agent)
                .phase(DraftSequenceTemplate.DraftPhase.valueOf(request.getPhase()))
                .actionType(DraftSequenceTemplate.DraftActionType.valueOf(request.getActionType()))
                .stepNumber(draftState.getCurrentStepNumber())
                .isAuto(false)
                .build();

        draftActionRepository.save(newAction);

        // 6. Chuyển lượt: Cộng dồn số bước (step_number) lên 1 để nhường lượt cho đội kia
        draftState.setCurrentStepNumber(draftState.getCurrentStepNumber() + 1);
        
        // Lưu cập nhật vào DB
        matchDraftStateRepository.save(draftState);

        // 7. Trả về thông báo thành công cho WebSocket phát sóng
        String resultMsg = String.format("Đội %d vừa %s Đặc vụ %s (Bước %d)", 
                request.getTeamId(), request.getActionType(), agent.getName(), draftState.getCurrentStepNumber());
        
        log.info("🟢 [Service] {}", resultMsg);
        return resultMsg;
    }
}