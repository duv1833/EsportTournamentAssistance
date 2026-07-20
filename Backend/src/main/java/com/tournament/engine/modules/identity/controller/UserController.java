package com.tournament.engine.modules.identity.controller;

import com.tournament.engine.modules.identity.dto.UserProfileRequest;
import com.tournament.engine.modules.identity.dto.UserResponse;
import com.tournament.engine.modules.identity.service.UserService;
import com.tournament.engine.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getUserProfile(@PathVariable Long userId) {
        try {
            UserResponse profile = userService.getUserProfile(userId);
            return ResponseEntity.ok(ApiResponse.success(profile, "Lấy thông tin cá nhân thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody UserProfileRequest request) {
        try {
            UserResponse profile = userService.updateUserProfile(userId, request);
            return ResponseEntity.ok(ApiResponse.success(profile, "Cập nhật hồ sơ cá nhân thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
