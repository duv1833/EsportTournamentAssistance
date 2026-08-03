package com.tournament.engine.modules.tournament.controller;

import com.tournament.engine.modules.tournament.dto.DashboardStatsResponse;
import com.tournament.engine.modules.tournament.service.AdminDashboardService;
import com.tournament.engine.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(@RequestParam Long adminUserId) {
        try {
            // Usually, you would check if adminUserId actually belongs to an Admin user,
            // or rely on Spring Security. For now, we trust the caller.
            DashboardStatsResponse stats = dashboardService.getDashboardStats();
            return ResponseEntity.ok(ApiResponse.success(stats, "Lấy thống kê thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
