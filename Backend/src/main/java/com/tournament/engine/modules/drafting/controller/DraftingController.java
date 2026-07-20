package com.tournament.engine.modules.drafting.controller;

import com.tournament.engine.modules.drafting.dto.DraftActionRequest;
import com.tournament.engine.modules.drafting.service.DraftingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class DraftingController {

    private final SimpMessagingTemplate messagingTemplate;
    
    // Inject Service vừa viết vào đây
    private final DraftingService draftingService;

    @MessageMapping("/draft/action")
    public void handleDraftAction(@Payload DraftActionRequest request) {
        log.info("🔴 [WebSocket] Nhận yêu cầu từ UI: Đội {} muốn {} tướng {}", 
                 request.getTeamId(), request.getActionType(), request.getAgentName());

        String destination = "/topic/match/" + request.getMatchId();

        try {
            // Bước 1: Gọi Database để check bảo mật và Lưu thông tin
            String responseMessage = draftingService.processAction(request);

            // Bước 2: Nếu lưu DB thành công, phát sóng kết quả cho cả phòng cùng xem
            messagingTemplate.convertAndSend(destination, responseMessage);
            log.info("🟢 [WebSocket] Đã phát sóng: {}", responseMessage);

        } catch (Exception e) {
            log.error("❌ Lỗi Ban/Pick: {}", e.getMessage());
            // Nếu có lỗi (VD: Cấm trùng, hoặc chưa tới lượt), báo lỗi đỏ lên màn hình
            messagingTemplate.convertAndSend(destination, "LỖI: " + e.getMessage());
        }
    }
}