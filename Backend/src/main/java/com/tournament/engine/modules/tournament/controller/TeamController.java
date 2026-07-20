package com.tournament.engine.modules.tournament.controller;

import com.tournament.engine.modules.tournament.dto.TeamResponse;
import com.tournament.engine.modules.tournament.service.TeamService;
import com.tournament.engine.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getAllTeams() {
        try {
            return ResponseEntity.ok(ApiResponse.success(teamService.getAllTeams(), "Lấy danh sách đội tuyển thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamResponse>> getTeamDetails(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(teamService.getTeamDetails(id), "Lấy chi tiết đội tuyển thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Lấy danh sách đội mà userId đang làm captain (để quản lý)
    @GetMapping("/captain/{captainId}")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getTeamsByCaptain(@PathVariable Long captainId) {
         try {
            return ResponseEntity.ok(ApiResponse.success(teamService.getTeamsByCaptain(captainId), "Lấy danh sách đội quản lý thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{teamId}/join")
    public ResponseEntity<ApiResponse<Void>> joinTeam(
            @PathVariable Long teamId,
            @RequestBody com.tournament.engine.modules.tournament.dto.JoinTeamRequest request) {
        try {
            teamService.joinTeam(teamId, request);
            return ResponseEntity.ok(ApiResponse.success(null, "Đã gửi yêu cầu tham gia đội tuyển!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{teamId}/members/{memberId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveJoinRequest(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            @RequestParam Long captainId) {
        try {
            teamService.approveJoinRequest(teamId, memberId, captainId);
            return ResponseEntity.ok(ApiResponse.success(null, "Duyệt yêu cầu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{teamId}/members/{memberId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectJoinRequest(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            @RequestParam Long captainId) {
        try {
            teamService.rejectJoinRequest(teamId, memberId, captainId);
            return ResponseEntity.ok(ApiResponse.success(null, "Đã từ chối yêu cầu tham gia!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{teamId}/members/{memberId}/kick")
    public ResponseEntity<ApiResponse<Void>> kickMember(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            @RequestParam Long captainId) {
        try {
            teamService.kickMember(teamId, memberId, captainId);
            return ResponseEntity.ok(ApiResponse.success(null, "Đã kích thành viên khỏi đội!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
