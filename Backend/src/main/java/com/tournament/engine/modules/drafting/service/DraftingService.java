package com.tournament.engine.modules.drafting.service;

import com.tournament.engine.modules.drafting.dto.DraftActionRequest;
import com.tournament.engine.modules.drafting.model.*;
import com.tournament.engine.modules.drafting.repository.*;
import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.identity.repository.UserRepository;
import com.tournament.engine.modules.tournament.model.Team;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DraftingService {

    private final DraftActionRepository draftActionRepository;
    private final MatchDraftStateRepository matchDraftStateRepository;
    private final AgentRepository agentRepository;
    private final UserRepository userRepository;
    private final GameMapRepository gameMapRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final DraftSequenceTemplateRepository draftSequenceTemplateRepository;

    private static final int DEFAULT_TURN_SECONDS = 30;
    private final Random random = new Random();

    @Transactional
    public Map<String, Object> processAction(DraftActionRequest request) {
        MatchDraftState draftState = matchDraftStateRepository.findById(request.getMatchId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạng thái Draft cho Ván " + request.getMatchId()));

        if (draftState.getDraftStatus() == MatchDraftState.DraftStatus.COMPLETED) {
            throw new RuntimeException("Quá trình Ban/Pick trận đấu này đã kết thúc!");
        }

        if (!draftState.getCurrentTurnTeam().getId().equals(request.getTeamId())) {
            throw new RuntimeException("LỖI BẢO MẬT: Chưa tới lượt của đội " + request.getTeamId());
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản thao tác!"));

        DraftAction.DraftActionBuilder newActionBuilder = DraftAction.builder()
                .match(draftState.getMatch())
                .team(draftState.getCurrentTurnTeam())
                .user(user)
                .phase(DraftSequenceTemplate.DraftPhase.valueOf(request.getPhase()))
                .actionType(DraftSequenceTemplate.DraftActionType.valueOf(request.getActionType()))
                .stepNumber(draftState.getCurrentStepNumber())
                .isAuto(false);

        if (request.getPhase().equalsIgnoreCase("MAP")) {
    GameMap map = gameMapRepository.findByName(request.getMapName())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy bản đồ: " + request.getMapName()));
    
    // Kiểm tra xem map này đã từng có bất kỳ Action nào (BAN hoặc PICK) trong ván này chưa
    if (draftActionRepository.existsByMatchIdAndMapId(request.getMatchId(), map.getId())) {
        throw new RuntimeException("Bản đồ " + map.getName() + " đã bị cấm hoặc chọn rồi, không được phép thao tác lại!");
    }
    
    newActionBuilder.map(map);
} else {
            Agent agent = agentRepository.findByName(request.getAgentName())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Đặc vụ: " + request.getAgentName()));
            if (draftActionRepository.existsByMatchIdAndAgentId(request.getMatchId(), agent.getId())) {
                throw new RuntimeException("Đặc vụ " + agent.getName() + " đã bị cấm hoặc chọn rồi!");
            }
            newActionBuilder.agent(agent);
        }

        draftActionRepository.save(newActionBuilder.build());

        int nextStep = draftState.getCurrentStepNumber() + 1;
        draftState.setCurrentStepNumber(nextStep);
        
        return updateNextTurnState(draftState, nextStep, request.getActionType(), request.getPhase(), 
                request.getMapName(), request.getAgentName(), false);
    }

    private Map<String, Object> updateNextTurnState(MatchDraftState draftState, int nextStep, 
                                                    String actionType, String phase, 
                                                    String mapName, String agentName, boolean isAuto) {
        
        // FIX LỖI 1: Thêm .name() để parse Enum thành String
        String format = draftState.getMatch() != null && draftState.getMatch().getFormat() != null
                ? draftState.getMatch().getFormat().toString() : "BO3";

        DraftSequenceTemplate nextTemplate = draftSequenceTemplateRepository.findByFormatAndStepNumber(format, nextStep)
                .orElse(null);

        if (nextTemplate == null) {
            draftState.setDraftStatus(MatchDraftState.DraftStatus.COMPLETED);
            draftState.setCurrentTurnTeam(null);
            draftState.setTurnDeadlineAt(null);
        } else {
            Team nextTeam = (nextTemplate.getTurnOrder() == 1) 
                    ? draftState.getMatch().getTeam1() 
                    : draftState.getMatch().getTeam2();
            
            draftState.setCurrentTurnTeam(nextTeam);
            draftState.setTurnDeadlineAt(LocalDateTime.now().plusSeconds(DEFAULT_TURN_SECONDS));
        }

        matchDraftStateRepository.save(draftState);

        // FIX LỖI 2: Dùng HashMap thay vì Map.of để vượt giới hạn 10 phần tử và tránh lỗi null
        Map<String, Object> payload = new HashMap<>();
        payload.put("matchId", draftState.getMatchId());
        payload.put("auto", isAuto);
        payload.put("actionType", actionType);
        payload.put("phase", phase);
        payload.put("mapName", "MAP".equalsIgnoreCase(phase) ? mapName : "");
        payload.put("agentName", !"MAP".equalsIgnoreCase(phase) ? agentName : "");
        payload.put("currentStep", nextStep - 1);
        payload.put("nextStep", nextStep);
        payload.put("draftStatus", draftState.getDraftStatus().name());
        payload.put("nextTurnTeamId", draftState.getCurrentTurnTeam() != null ? draftState.getCurrentTurnTeam().getId() : null);
        payload.put("message", "MAP".equalsIgnoreCase(phase) 
                ? String.format("Đội vừa %s bản đồ %s", actionType, mapName)
                : String.format("Đội vừa %s đặc vụ %s", actionType, agentName));

        messagingTemplate.convertAndSend(String.format("/topic/draft/%d", draftState.getMatchId()), payload);
        return payload;
    }

    @Scheduled(fixedDelayString = "3000")
    @Transactional
    public void processExpiredTurns() {
        LocalDateTime now = LocalDateTime.now();
        List<MatchDraftState> expired = matchDraftStateRepository.findAll().stream()
                .filter(s -> s.getDraftStatus() == MatchDraftState.DraftStatus.IN_PROGRESS
                        && s.getTurnDeadlineAt() != null
                        && !s.getTurnDeadlineAt().isAfter(now))
                .collect(Collectors.toList());

        for (MatchDraftState draftState : expired) {
            try {
                handleExpiredDraftState(draftState);
            } catch (Exception e) {
                log.error("Lỗi xử lý timeout tự động cho ván {}: {}", draftState.getMatchId(), e.getMessage());
            }
        }
    }

    private void handleExpiredDraftState(MatchDraftState draftState) {
        // FIX LỖI 3: Thêm .name() ở đây nữa
        String format = draftState.getMatch() != null && draftState.getMatch().getFormat() != null
                ? draftState.getMatch().getFormat().toString() : "BO3";

        DraftSequenceTemplate template = draftSequenceTemplateRepository.findByFormatAndStepNumber(format, draftState.getCurrentStepNumber())
                .orElse(null);

        if (template == null) {
            draftState.setCurrentStepNumber(draftState.getCurrentStepNumber() + 1);
            updateNextTurnState(draftState, draftState.getCurrentStepNumber(), "BAN", "MAP", "", "", true);
            return;
        }

        User systemUser = userRepository.findByUsername("admin")
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));

        DraftAction.DraftActionBuilder autoActionBuilder = DraftAction.builder()
                .match(draftState.getMatch())
                .team(draftState.getCurrentTurnTeam())
                .user(systemUser)
                .phase(template.getPhase())
                .actionType(template.getActionType())
                .stepNumber(draftState.getCurrentStepNumber())
                .isAuto(true);

        String targetName = "";

        if (template.getPhase() == DraftSequenceTemplate.DraftPhase.AGENT) {
            List<Agent> candidates = agentRepository.findByIsActiveTrue().stream()
                    .filter(a -> !draftActionRepository.existsByMatchIdAndAgentId(draftState.getMatchId(), a.getId()))
                    .collect(Collectors.toList());
            if (!candidates.isEmpty()) {
                Agent chosen = candidates.get(random.nextInt(candidates.size()));
                autoActionBuilder.agent(chosen);
                targetName = chosen.getName();
            }
        } else {
            List<GameMap> maps = gameMapRepository.findByIsActiveTrue().stream()
                    .filter(m -> !draftActionRepository.existsByMatchIdAndMapId(draftState.getMatchId(), m.getId()))
                    .collect(Collectors.toList());
            if (!maps.isEmpty()) {
                GameMap chosenMap = maps.get(random.nextInt(maps.size()));
                autoActionBuilder.map(chosenMap);
                targetName = chosenMap.getName();
            }
        }

        draftActionRepository.save(autoActionBuilder.build());

        int nextStep = draftState.getCurrentStepNumber() + 1;
        draftState.setCurrentStepNumber(nextStep);
        updateNextTurnState(draftState, nextStep, template.getActionType().name(), template.getPhase().name(), targetName, targetName, true);
        
        log.info("🟡 [Auto-Timeout] Đã tự động xử lý bước {} là {}", nextStep - 1, targetName);
    }
}
