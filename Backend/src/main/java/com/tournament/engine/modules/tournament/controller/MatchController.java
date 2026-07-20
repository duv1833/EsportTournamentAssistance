package com.tournament.engine.modules.tournament.controller;

import com.tournament.engine.modules.tournament.dto.MatchResponse;
import com.tournament.engine.modules.tournament.dto.MatchUpdateRequest;
import com.tournament.engine.modules.tournament.service.MatchService;
import com.tournament.engine.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MatchController {

    private final MatchService matchService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getAllUpcomingMatches() {
        try {
            List<MatchResponse> matches = matchService.getAllUpcomingMatches();
            return ResponseEntity.ok(ApiResponse.success(matches, "Lấy danh sách trận đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getMatchesByTournament(@PathVariable Long tournamentId) {
        try {
            List<MatchResponse> matches = matchService.getMatchesByTournament(tournamentId);
            return ResponseEntity.ok(ApiResponse.success(matches, "Lấy danh sách trận đấu của giải thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/tournament/{tournamentId}/generate")
    public ResponseEntity<ApiResponse<Void>> generateBracket(
            @PathVariable Long tournamentId,
            @RequestParam Long userId,
            @RequestBody com.tournament.engine.modules.tournament.dto.GenerateBracketRequest request) {
        try {
            matchService.generateBracket(tournamentId, userId, request);
            return ResponseEntity.ok(ApiResponse.success(null, "Tạo sơ đồ thi đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{matchId}/score")
    public ResponseEntity<ApiResponse<MatchResponse>> updateMatchResult(
            @PathVariable Long matchId,
            @RequestBody MatchUpdateRequest request,
            @RequestParam Long userId) {
        try {
            MatchResponse response = matchService.updateMatchResult(matchId, request, userId);
            return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật kết quả trận đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
