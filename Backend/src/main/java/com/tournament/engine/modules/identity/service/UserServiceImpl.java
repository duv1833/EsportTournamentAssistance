package com.tournament.engine.modules.identity.service;

import com.tournament.engine.modules.identity.dto.AuthResponse;
import com.tournament.engine.modules.identity.dto.LoginRequest;
import com.tournament.engine.modules.identity.dto.RegisterRequest;
import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .globalRole(User.GlobalRole.USER)
                .roles(java.util.Set.of(User.GlobalRole.USER))
                .isActive(true)
                .build();

        user = userRepository.save(user);

        return AuthResponse.builder()
                .token("mock-jwt-token-for-" + user.getUsername())
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .globalRole(user.getGlobalRole().name())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsernameOrEmail());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(request.getUsernameOrEmail());
        }

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không chính xác!");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không chính xác!");
        }
        
        if (!user.getIsActive()) {
            throw new RuntimeException("Tài khoản đã bị khóa!");
        }

        return AuthResponse.builder()
                .token("mock-jwt-token-for-" + user.getUsername())
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .globalRole(user.getGlobalRole().name())
                .build();
    }

    @Override
    public java.util.List<com.tournament.engine.modules.identity.dto.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> com.tournament.engine.modules.identity.dto.UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .globalRole(user.getGlobalRole().name())
                        .isActive(user.getIsActive())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        if (user.getGlobalRole() == User.GlobalRole.ADMIN) {
            throw new RuntimeException("Không thể khóa tài khoản Admin");
        }
        
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setIsActive(true);
        userRepository.save(user);
    }
}
