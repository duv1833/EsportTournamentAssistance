package com.tournament.engine.config;

import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.jdbc.core.JdbcTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        // 0. Tự động xóa ràng buộc CHECK constraint rác của SQL Server trên các cột Enum nếu có
        try {
            String dropCheckConstraintsSql =
                "DECLARE @sql NVARCHAR(MAX) = ''; " +
                "SELECT @sql += 'ALTER TABLE ' + QUOTENAME(tc.TABLE_SCHEMA) + '.' + QUOTENAME(tc.TABLE_NAME) + ' DROP CONSTRAINT ' + QUOTENAME(tc.CONSTRAINT_NAME) + ';' " +
                "FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc " +
                "JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME " +
                "WHERE tc.CONSTRAINT_TYPE = 'CHECK' AND ccu.COLUMN_NAME IN ('status', 'roles', 'global_role', 'approval_status', 'registration_status'); " +
                "IF @sql <> '' EXEC sp_executesql @sql;";
            jdbcTemplate.execute(dropCheckConstraintsSql);
            log.info("Đã loại bỏ các CHECK constraint cũ trên SQL Server để cập nhật Enum thành công!");
        } catch (Exception e) {
            log.warn("Không thể tự động xóa CHECK constraint: {}", e.getMessage());
        }

        log.info("Khởi tạo & Đồng bộ dữ liệu vai trò người dùng (Roles & Users)...");

        // 1. Tạo tài khoản Admin mặc định nếu chưa tồn tại
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@tacticaledge.com")
                    .password(passwordEncoder.encode("123"))
                    .fullName("System Administrator")
                    .globalRole(User.GlobalRole.ADMIN)
                    .roles(Set.of(User.GlobalRole.ADMIN))
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Đã khởi tạo tài khoản Admin mặc định (username: admin, password: 123)");
        }

        // Helper method logic để tạo các tài khoản demo
        createDemoUserIfNotExist("organizer", "organizer@tacticaledge.com", "Ban Tổ Chức Giải", User.GlobalRole.ORGANIZER);
        createDemoUserIfNotExist("referee1", "referee1@tacticaledge.com", "Trọng Tài 01", User.GlobalRole.REFEREE);
        createDemoUserIfNotExist("sgp_captain", "sgp@tacticaledge.com", "SGP Leader (Saigon Phantom)", User.GlobalRole.USER);
        createDemoUserIfNotExist("prx_captain", "prx@tacticaledge.com", "PRX Leader (Paper Rex)", User.GlobalRole.USER);
        createDemoUserIfNotExist("ts_captain", "ts@tacticaledge.com", "TS Leader (Team Secret)", User.GlobalRole.USER);
        createDemoUserIfNotExist("t1_captain", "t1@tacticaledge.com", "T1 Leader (T1 Esports)", User.GlobalRole.USER);
        createDemoUserIfNotExist("user1", "user1@tacticaledge.com", "Player One", User.GlobalRole.USER);
        createDemoUserIfNotExist("user2", "user2@tacticaledge.com", "Player Two", User.GlobalRole.USER);

        // 2. Đồng bộ role cho tất cả người dùng hiện có trong database nếu roles trống hoặc globalRole null
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            boolean updated = false;
            
            if (user.getGlobalRole() == null) {
                user.setGlobalRole(user.getUsername().equalsIgnoreCase("admin") ? User.GlobalRole.ADMIN : User.GlobalRole.USER);
                updated = true;
            }

            if (user.getRoles() == null || user.getRoles().isEmpty()) {
                Set<User.GlobalRole> roles = new HashSet<>();
                roles.add(user.getGlobalRole());
                user.setRoles(roles);
                updated = true;
            }

            if (updated) {
                userRepository.save(user);
                log.info("Cập nhật vai trò thành công cho user: {}", user.getUsername());
            }
        }
    }

    private void createDemoUserIfNotExist(String username, String email, String fullName, User.GlobalRole role) {
        if (!userRepository.existsByUsername(username)) {
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode("123"))
                    .fullName(fullName)
                    .globalRole(role)
                    .roles(Set.of(role))
                    .isActive(true)
                    .build();
            userRepository.save(user);
            log.info("Đã tạo tài khoản demo: {} ({}) với mật khẩu '123'", username, role);
        }
    }
}
