package com.tournament.engine.modules.drafting.controller;

import com.tournament.engine.modules.drafting.dto.DraftActionRequest;
import com.tournament.engine.modules.drafting.service.DraftingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class DraftingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final DraftingService draftingService;

    @MessageMapping("/draft/action")
    public void handleDraftAction(@Payload DraftActionRequest request) {
        String targetName = "MAP".equals(request.getPhase()) ? request.getMapName() : request.getAgentName();
        log.info("🔴 [WebSocket] Nhận yêu cầu: Đội {} -> {} {} [{}]",
                request.getTeamId(), request.getActionType(), request.getPhase(), targetName);

        String destination = "/topic/draft/" + request.getMatchId();

        try {
            // Hàm xử lý bên trong Service đã tự tích hợp phát sóng trạng thái sang WebSocket
            draftingService.processAction(request);
            log.info("🟢 [WebSocket] Xử lý hành động thành công cho trận đấu {}", request.getMatchId());

        } catch (Exception e) {
            log.error("❌ Lỗi nghiệp vụ Ban/Pick: {}", e.getMessage());
            // Trả về dữ liệu báo lỗi chuẩn cho UI
            messagingTemplate.convertAndSend(destination, Map.of(
                    "error", true,
                    "message", e.getMessage()
            ));
        }
    }
}