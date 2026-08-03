package com.tournament.engine.modules.tournament.controller;

import com.tournament.engine.modules.tournament.service.PandaScoreService;
import com.tournament.engine.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/external/matches")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ExternalMatchController {

    private final PandaScoreService pandaScoreService;

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUpcomingMatches(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int perPage) {
        List<Map<String, Object>> matches = pandaScoreService.getUpcomingValorantMatches(page, perPage);
        return ResponseEntity.ok(ApiResponse.success(matches, "Lấy danh sách trận sắp diễn ra thành công!"));
    }

    @GetMapping("/running")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRunningMatches(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int perPage) {
        List<Map<String, Object>> matches = pandaScoreService.getRunningValorantMatches(page, perPage);
        return ResponseEntity.ok(ApiResponse.success(matches, "Lấy danh sách trận đang diễn ra thành công!"));
    }

    @GetMapping("/past")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPastMatches(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int perPage) {
        List<Map<String, Object>> matches = pandaScoreService.getPastValorantMatches(page, perPage);
        return ResponseEntity.ok(ApiResponse.success(matches, "Lấy danh sách trận đã kết thúc thành công!"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllMatches(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int perPage) {
        List<Map<String, Object>> matches = pandaScoreService.getAllValorantMatches(page, perPage);
        return ResponseEntity.ok(ApiResponse.success(matches, "Lấy danh sách trận đấu thành công!"));
    }
}
