package com.tournament.engine.modules.identity.service;

import com.tournament.engine.modules.identity.dto.AuthResponse;
import com.tournament.engine.modules.identity.dto.LoginRequest;
import com.tournament.engine.modules.identity.dto.RegisterRequest;
import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.identity.repository.UserRepository;
import com.tournament.engine.modules.identity.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getUsername() == null || !request.getUsername().matches("^[a-zA-Z0-9_]{3,20}$")) {
            throw new RuntimeException("Tên đăng nhập phải từ 3-20 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới!");
        }
        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new RuntimeException("Email không hợp lệ!");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự!");
        }

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
                .token(jwtService.generateToken(user))
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .nickname(user.getNickname())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .displayName(user.getDisplayName())
                .globalRole(user.getGlobalRole().name())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
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
                .token(jwtService.generateToken(user))
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .nickname(user.getNickname())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .displayName(user.getDisplayName())
                .globalRole(user.getGlobalRole().name())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public com.tournament.engine.modules.identity.dto.UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public com.tournament.engine.modules.identity.dto.UserResponse updateUserProfile(Long userId, com.tournament.engine.modules.identity.dto.UserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            String fullName = request.getFullName().trim();
            if (fullName.length() < 2 || fullName.length() > 50) {
                throw new RuntimeException("Họ và tên phải có độ dài từ 2 đến 50 ký tự!");
            }
            if (!fullName.matches("^[a-zA-ZÀ-ỹ\\s'-]+$")) {
                throw new RuntimeException("Họ và tên chỉ được chứa chữ cái và khoảng trắng, không chứa số hoặc ký tự đặc biệt!");
            }
            user.setFullName(fullName);
        }
        if (request.getNickname() != null && !request.getNickname().isBlank()) {
            String nick = request.getNickname().trim();
            if (!nick.matches("^[a-zA-Z0-9_\\s]{2,20}#[a-zA-Z0-9]{2,6}$")) {
                throw new RuntimeException("Tên In-Game phải đúng định dạng 'Tên ingame + #Tag' (Ví dụ: TenZ#NA1, Faker#KR1, Dux#0006)");
            }
            user.setNickname(nick);
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            String phone = request.getPhoneNumber().trim();
            if (!phone.matches("^(0[3|5|7|8|9])+([0-9]{8})$")) {
                throw new RuntimeException("Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (Ví dụ: 0912345678)");
            }
            user.setPhoneNumber(phone);
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            String url = request.getAvatarUrl().trim();
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                throw new RuntimeException("URL Ảnh đại diện phải bắt đầu bằng http:// hoặc https://");
            }
            user.setAvatarUrl(url);
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim();
            if (!newEmail.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                throw new RuntimeException("Định dạng email không hợp lệ!");
            }
            if (!newEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new RuntimeException("Email '" + newEmail + "' đã được sử dụng bởi tài khoản khác!");
                }
                user.setEmail(newEmail);
            }
        }

        user = userRepository.saveAndFlush(user);
        return mapToUserResponse(user);
    }

    @Override
    public java.util.List<com.tournament.engine.modules.identity.dto.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public java.util.List<com.tournament.engine.modules.identity.dto.UserResponse> searchUsers(String query) {
        if (query == null || query.trim().length() < 1) {
            return java.util.Collections.emptyList();
        }
        String q = query.trim();
        return userRepository.findTop10ByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(q, q, q).stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .map(this::mapToUserResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private com.tournament.engine.modules.identity.dto.UserResponse mapToUserResponse(User user) {
        return com.tournament.engine.modules.identity.dto.UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .nickname(user.getNickname())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .displayName(user.getDisplayName())
                .globalRole(user.getGlobalRole().name())
                .isActive(user.getIsActive())
                .build();
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
