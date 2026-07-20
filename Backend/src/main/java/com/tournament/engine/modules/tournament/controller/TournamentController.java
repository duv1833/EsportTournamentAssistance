package com.tournament.engine.modules.tournament.controller;

import com.tournament.engine.modules.tournament.dto.TournamentCreateRequest;
import com.tournament.engine.modules.tournament.dto.TournamentRegisterRequest;
import com.tournament.engine.modules.tournament.dto.TournamentResponse;
import com.tournament.engine.modules.tournament.service.TournamentService;
import com.tournament.engine.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tournaments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TournamentController {

    private final TournamentService tournamentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> getAllTournaments() {
        try {
            List<TournamentResponse> response = tournamentService.getAllTournaments();
            return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách giải đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TournamentResponse>> getTournamentDetails(@PathVariable Long id) {
        try {
            TournamentResponse response = tournamentService.getTournamentDetails(id);
            return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết giải đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TournamentResponse>> createTournament(@RequestBody TournamentCreateRequest request) {
        try {
            TournamentResponse response = tournamentService.createTournament(request);
            return ResponseEntity.ok(ApiResponse.success(response, "Tạo giải đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<Void>> registerForTournament(
            @PathVariable Long id,
            @RequestBody TournamentRegisterRequest request) {
        try {
            tournamentService.registerForTournament(id, request);
            return ResponseEntity.ok(ApiResponse.success(null, "Đăng ký tham gia giải đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateTournament(
            @PathVariable Long id,
            @RequestBody TournamentCreateRequest request,
            @RequestParam Long organizerUserId
    ) {
        try {
            tournamentService.updateTournament(id, request, organizerUserId);
            return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật giải đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<ApiResponse<List<com.tournament.engine.modules.tournament.dto.TournamentRegistrationResponse>>> getTournamentRegistrations(
            @PathVariable Long id,
            @RequestParam Long organizerUserId // In a real app, get from SecurityContext
    ) {
        try {
            List<com.tournament.engine.modules.tournament.dto.TournamentRegistrationResponse> response = tournamentService.getTournamentRegistrations(id, organizerUserId);
            return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách đăng ký thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/registrations/{teamId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveRegistration(
            @PathVariable Long id,
            @PathVariable Long teamId,
            @RequestParam Long organizerUserId // In a real app, get from SecurityContext
    ) {
        try {
            tournamentService.approveRegistration(id, teamId, organizerUserId);
            return ResponseEntity.ok(ApiResponse.success(null, "Duyệt đội tuyển thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/registrations/{teamId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectRegistration(
            @PathVariable Long id,
            @PathVariable Long teamId,
            @RequestParam Long organizerUserId // In a real app, get from SecurityContext
    ) {
        try {
            tournamentService.rejectRegistration(id, teamId, organizerUserId);
            return ResponseEntity.ok(ApiResponse.success(null, "Từ chối đội tuyển thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Admin endpoints for Tournament Approval
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> getAdminTournaments(@RequestParam Long adminUserId) {
        try {
            List<TournamentResponse> response = tournamentService.getAllTournamentsForAdmin(adminUserId);
            return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách tất cả giải đấu cho Admin thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/approve-tournament")
    public ResponseEntity<ApiResponse<Void>> approveTournament(
            @PathVariable Long id,
            @RequestParam Long adminUserId
    ) {
        try {
            tournamentService.approveTournament(id, adminUserId);
            return ResponseEntity.ok(ApiResponse.success(null, "Duyệt giải đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject-tournament")
    public ResponseEntity<ApiResponse<Void>> rejectTournament(
            @PathVariable Long id,
            @RequestParam Long adminUserId
    ) {
        try {
            tournamentService.rejectTournament(id, adminUserId);
            return ResponseEntity.ok(ApiResponse.success(null, "Từ chối và xóa giải đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/admin-update")
    public ResponseEntity<ApiResponse<Void>> updateTournamentByAdmin(
            @PathVariable Long id,
            @RequestBody TournamentCreateRequest request,
            @RequestParam Long adminUserId
    ) {
        try {
            tournamentService.updateTournamentByAdmin(id, request, adminUserId);
            return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật giải đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/admin-delete")
    public ResponseEntity<ApiResponse<Void>> deleteTournamentByAdmin(
            @PathVariable Long id,
            @RequestParam Long adminUserId
    ) {
        try {
            tournamentService.deleteTournamentByAdmin(id, adminUserId);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa giải đấu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
