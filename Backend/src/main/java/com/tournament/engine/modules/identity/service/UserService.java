package com.tournament.engine.modules.identity.service;

import com.tournament.engine.modules.identity.dto.AuthResponse;
import com.tournament.engine.modules.identity.dto.LoginRequest;
import com.tournament.engine.modules.identity.dto.RegisterRequest;

import java.util.List;
import com.tournament.engine.modules.identity.dto.UserResponse;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    
    // Admin features
    List<UserResponse> getAllUsers();
    void banUser(Long userId);
    void unbanUser(Long userId);
}
