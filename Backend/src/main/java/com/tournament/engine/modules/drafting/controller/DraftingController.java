package com.tournament.engine.modules.drafting.controller;

import com.tournament.engine.modules.drafting.dto.DraftActionRequest;
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

    // Công cụ dùng để "phát sóng" data ngược lại cho Frontend
    private final SimpMessagingTemplate messagingTemplate;

    // TODO: Khai báo DraftingService ở đây (ta sẽ viết nó ở bước sau)
    // private final DraftingService draftingService;

    /**
     * React sẽ gửi thông điệp vào địa chỉ: /app/draft/action
     */
    @MessageMapping("/draft/action")
    public void handleDraftAction(@Payload DraftActionRequest request) {
        log.info("🔴 [WebSocket] Nhận yêu cầu Ban/Pick: {}", request);

        try {
            // Bước 1: Gọi Service để xử lý logic (Kiểm tra lượt, lưu DB, tự động chuyển lượt...)
            // DraftStateResponse response = draftingService.processAction(request);

            // TẠM THỜI GIẢ LẬP KẾT QUẢ ĐỂ TEST WEBSOCKET
            String mockResponse = "Đội " + request.getTeamId() + " vừa " + request.getActionType() + " " + request.getAgentName();

            // Bước 2: Phát sóng kết quả cho toàn bộ những người đang đăng ký kênh của ván đấu này
            // React sẽ nghe ở kênh: /topic/match/102
            String destination = "/topic/match/" + request.getMatchId();
            messagingTemplate.convertAndSend(destination, mockResponse);
            
            log.info("🟢 [WebSocket] Đã phát sóng kết quả tới kênh: {}", destination);

        } catch (Exception e) {
            log.error("❌ Lỗi xử lý Ban/Pick: ", e);
            // Nếu có lỗi (VD: Cấm trùng), gửi lỗi riêng cho User đó (hoặc gửi lên kênh chung tuỳ cậu)
            // messagingTemplate.convertAndSend("/topic/match/" + request.getMatchId() + "/errors", e.getMessage());
        }
    }
}