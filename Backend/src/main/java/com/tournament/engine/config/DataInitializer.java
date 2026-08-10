package com.tournament.engine.config;

import com.tournament.engine.modules.drafting.model.Agent;
import com.tournament.engine.modules.drafting.model.GameMap;
import com.tournament.engine.modules.drafting.repository.AgentRepository;
import com.tournament.engine.modules.drafting.repository.GameMapRepository;
import com.tournament.engine.modules.identity.model.User;
import com.tournament.engine.modules.identity.repository.UserRepository;
import com.tournament.engine.modules.tournament.model.Team;
import com.tournament.engine.modules.tournament.repository.TeamRepository;
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

import com.tournament.engine.modules.drafting.model.DraftAction;
import com.tournament.engine.modules.drafting.model.DraftSequenceTemplate;
import com.tournament.engine.modules.drafting.repository.DraftActionRepository;
import com.tournament.engine.modules.tournament.model.Match;
import com.tournament.engine.modules.tournament.repository.MatchRepository;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final AgentRepository agentRepository;
    private final GameMapRepository gameMapRepository;
    private final MatchRepository matchRepository;
    private final DraftActionRepository draftActionRepository;
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

            try {
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN full_name NVARCHAR(255)");
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN nickname NVARCHAR(255)");
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN phone_number NVARCHAR(50)");
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN avatar_url NVARCHAR(1000)");
            } catch (Exception ex) {
                log.warn("Cột users đã là NVARCHAR hoặc không thể thay đổi: {}", ex.getMessage());
            }

            log.info("Đã loại bỏ các CHECK constraint cũ và cấu hình NVARCHAR trên SQL Server thành công!");
        } catch (Exception e) {
            log.warn("Không thể tự động xóa CHECK constraint: {}", e.getMessage());
        }

        log.info("Khởi tạo & Đồng bộ dữ liệu vai trò người dùng (Roles & Users)...");

        // 1. Tạo tài khoản Admin mặc định nếu chưa tồn tại
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@eta.com")
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
        createDemoUserIfNotExist("organizer", "organizer@eta.com", "Ban Tổ Chức Giải", User.GlobalRole.ORGANIZER);
        createDemoUserIfNotExist("referee1", "referee1@eta.com", "Trọng Tài 01", User.GlobalRole.REFEREE);
        createDemoUserIfNotExist("sgp_captain", "sgp@eta.com", "SGP Leader (Saigon Phantom)", User.GlobalRole.USER);
        createDemoUserIfNotExist("prx_captain", "prx@eta.com", "PRX Leader (Paper Rex)", User.GlobalRole.USER);
        createDemoUserIfNotExist("ts_captain", "ts@eta.com", "TS Leader (Team Secret)", User.GlobalRole.USER);
        createDemoUserIfNotExist("t1_captain", "t1@eta.com", "T1 Leader (T1 Esports)", User.GlobalRole.USER);
        createDemoUserIfNotExist("user1", "user1@eta.com", "Player One", User.GlobalRole.USER);
        createDemoUserIfNotExist("user2", "user2@eta.com", "Player Two", User.GlobalRole.USER);

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

        // 3. Khởi tạo mã mời (inviteCode) cố định cho tất cả các đội tuyển chưa có mã mời
        List<Team> allTeams = teamRepository.findAll();
        for (Team team : allTeams) {
            if (team.getInviteCode() == null || team.getInviteCode().isBlank()) {
                team.setInviteCode(java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                teamRepository.save(team);
                log.info("Đã khởi tạo mã mời ({}) cho đội tuyển: {}", team.getInviteCode(), team.getName());
            }
        }

        // 4. Khởi tạo danh sách Agent (Tướng) nếu chưa có dữ liệu
        if (agentRepository.count() == 0) {
            log.info("Khởi tạo danh sách Agent Valorant mặc định...");
            List<Agent> defaultAgents = List.of(
                Agent.builder().name("Jett").roleType("Duelist").imageUrl("https://media.valorant-api.com/agents/ad703507-4156-8137-8821-96f626382968/displayicon.png").isActive(true).build(),
                Agent.builder().name("Phoenix").roleType("Duelist").imageUrl("https://media.valorant-api.com/agents/eb93336a-449e-44c3-5468-056f111034ba/displayicon.png").isActive(true).build(),
                Agent.builder().name("Reyna").roleType("Duelist").imageUrl("https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png").isActive(true).build(),
                Agent.builder().name("Raze").roleType("Duelist").imageUrl("https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-b79d137bd8b8/displayicon.png").isActive(true).build(),
                Agent.builder().name("Yoru").roleType("Duelist").imageUrl("https://media.valorant-api.com/agents/7f9490d4-42f8-d0ce-bc80-37b45066138c/displayicon.png").isActive(true).build(),
                Agent.builder().name("Neon").roleType("Duelist").imageUrl("https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png").isActive(true).build(),
                Agent.builder().name("Iso").roleType("Duelist").imageUrl("https://media.valorant-api.com/agents/0e38b542-4789-06b4-0125-989c16526d82/displayicon.png").isActive(true).build(),
                Agent.builder().name("Sage").roleType("Sentinel").imageUrl("https://media.valorant-api.com/agents/56444735-4ed6-3b56-70ad-6f74c4105447/displayicon.png").isActive(true).build(),
                Agent.builder().name("Cypher").roleType("Sentinel").imageUrl("https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png").isActive(true).build(),
                Agent.builder().name("Killjoy").roleType("Sentinel").imageUrl("https://media.valorant-api.com/agents/1e588b59-4ee9-f2e7-d402-d28d5114c849/displayicon.png").isActive(true).build(),
                Agent.builder().name("Chamber").roleType("Sentinel").imageUrl("https://media.valorant-api.com/agents/22a37521-47bf-8b2b-99c4-b98a9667795b/displayicon.png").isActive(true).build(),
                Agent.builder().name("Deadlock").roleType("Sentinel").imageUrl("https://media.valorant-api.com/agents/cc8b0cf8-4b74-428c-7772-f19f5d3702a7/displayicon.png").isActive(true).build(),
                Agent.builder().name("Vyse").roleType("Sentinel").imageUrl("https://media.valorant-api.com/agents/96b920f5-465e-25ef-f5e6-49a888c32ec8/displayicon.png").isActive(true).build(),
                Agent.builder().name("Sova").roleType("Initiator").imageUrl("https://media.valorant-api.com/agents/320b2a1b-42d4-06d6-1600-3696bc7602aa/displayicon.png").isActive(true).build(),
                Agent.builder().name("Breach").roleType("Initiator").imageUrl("https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png").isActive(true).build(),
                Agent.builder().name("Skye").roleType("Initiator").imageUrl("https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b0908d7cfc4c/displayicon.png").isActive(true).build(),
                Agent.builder().name("KAY/O").roleType("Initiator").imageUrl("https://media.valorant-api.com/agents/601d3b66-4b64-23f5-5a58-86a5658aaeab/displayicon.png").isActive(true).build(),
                Agent.builder().name("Fade").roleType("Initiator").imageUrl("https://media.valorant-api.com/agents/ded3520f-4264-5edd-aa39-8ab49f4eb770/displayicon.png").isActive(true).build(),
                Agent.builder().name("Gekko").roleType("Initiator").imageUrl("https://media.valorant-api.com/agents/e2866995-465b-8706-088f-9a973d4d46bf/displayicon.png").isActive(true).build(),
                Agent.builder().name("Brimstone").roleType("Controller").imageUrl("https://media.valorant-api.com/agents/9f0677a8-4298-8353-070b-01a9ed1b1165/displayicon.png").isActive(true).build(),
                Agent.builder().name("Viper").roleType("Controller").imageUrl("https://media.valorant-api.com/agents/70773516-4088-294c-b78b-5927b859858d/displayicon.png").isActive(true).build(),
                Agent.builder().name("Omen").roleType("Controller").imageUrl("https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png").isActive(true).build(),
                Agent.builder().name("Astra").roleType("Controller").imageUrl("https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png").isActive(true).build(),
                Agent.builder().name("Harbor").roleType("Controller").imageUrl("https://media.valorant-api.com/agents/2b2c807d-4a9c-8211-3472-568750a11b0b/displayicon.png").isActive(true).build(),
                Agent.builder().name("Clove").roleType("Controller").imageUrl("https://media.valorant-api.com/agents/096b4286-48c9-bc4d-1763-718e2689ef2e/displayicon.png").isActive(true).build()
            );
            agentRepository.saveAll(defaultAgents);
        }

        // 5. Khởi tạo danh sách Bản đồ (Map) nếu chưa có dữ liệu
        if (gameMapRepository.count() == 0) {
            log.info("Khởi tạo danh sách Map Valorant mặc định...");
            List<GameMap> defaultMaps = List.of(
                GameMap.builder().name("Ascent").isActive(true).build(),
                GameMap.builder().name("Bind").isActive(true).build(),
                GameMap.builder().name("Haven").isActive(true).build(),
                GameMap.builder().name("Split").isActive(true).build(),
                GameMap.builder().name("Icebox").isActive(true).build(),
                GameMap.builder().name("Breeze").isActive(true).build(),
                GameMap.builder().name("Fracture").isActive(true).build(),
                GameMap.builder().name("Pearl").isActive(true).build(),
                GameMap.builder().name("Lotus").isActive(true).build(),
                GameMap.builder().name("Sunset").isActive(true).build(),
                GameMap.builder().name("Abyss").isActive(true).build()
            );
            gameMapRepository.saveAll(defaultMaps);
        }

        // 6. Khởi tạo dữ liệu cấm/chọn (draft_actions) mẫu cho các trận đấu hiện có nếu chưa có dữ liệu cấm/chọn
        List<Match> allMatches = matchRepository.findAll();
        List<Agent> agents = agentRepository.findAll();
        if (!allMatches.isEmpty() && !agents.isEmpty()) {
            User defaultUser = userRepository.findAll().stream().findFirst().orElse(null);
            for (Match match : allMatches) {
                if (match.getTeam1() != null && match.getTeam2() != null 
                        && draftActionRepository.findByMatchIdOrderByStepNumberAsc(match.getId()).isEmpty()) {
                    log.info("Backfill dữ liệu cấm/chọn cho Trận đấu ID: {} ({} vs {})...", 
                            match.getId(), match.getTeam1().getName(), match.getTeam2().getName());
                    
                    List<DraftAction> backfillActions = new ArrayList<>();
                    int step = 1;
                    
                    // Lượt cấm (BAN) - 3 tướng mỗi đội
                    for (int i = 0; i < 3; i++) {
                        Agent banAgent1 = agents.get((i * 2) % agents.size());
                        Agent banAgent2 = agents.get((i * 2 + 1) % agents.size());
                        
                        backfillActions.add(DraftAction.builder()
                                .match(match)
                                .stepNumber(step++)
                                .phase(DraftSequenceTemplate.DraftPhase.AGENT)
                                .actionType(DraftSequenceTemplate.DraftActionType.BAN)
                                .team(match.getTeam1())
                                .user(match.getTeam1().getCaptain() != null ? match.getTeam1().getCaptain() : defaultUser)
                                .agent(banAgent1)
                                .isAuto(false)
                                .build());
                                
                        backfillActions.add(DraftAction.builder()
                                .match(match)
                                .stepNumber(step++)
                                .phase(DraftSequenceTemplate.DraftPhase.AGENT)
                                .actionType(DraftSequenceTemplate.DraftActionType.BAN)
                                .team(match.getTeam2())
                                .user(match.getTeam2().getCaptain() != null ? match.getTeam2().getCaptain() : defaultUser)
                                .agent(banAgent2)
                                .isAuto(false)
                                .build());
                    }
                    
                    // Lượt chọn (PICK) - 5 tướng mỗi đội
                    for (int i = 0; i < 5; i++) {
                        Agent pickAgent1 = agents.get((i * 2 + 6) % agents.size());
                        Agent pickAgent2 = agents.get((i * 2 + 7) % agents.size());
                        
                        backfillActions.add(DraftAction.builder()
                                .match(match)
                                .stepNumber(step++)
                                .phase(DraftSequenceTemplate.DraftPhase.AGENT)
                                .actionType(DraftSequenceTemplate.DraftActionType.PICK)
                                .team(match.getTeam1())
                                .user(match.getTeam1().getCaptain() != null ? match.getTeam1().getCaptain() : defaultUser)
                                .agent(pickAgent1)
                                .isAuto(false)
                                .build());
                                
                        backfillActions.add(DraftAction.builder()
                                .match(match)
                                .stepNumber(step++)
                                .phase(DraftSequenceTemplate.DraftPhase.AGENT)
                                .actionType(DraftSequenceTemplate.DraftActionType.PICK)
                                .team(match.getTeam2())
                                .user(match.getTeam2().getCaptain() != null ? match.getTeam2().getCaptain() : defaultUser)
                                .agent(pickAgent2)
                                .isAuto(false)
                                .build());
                    }
                    
                    draftActionRepository.saveAll(backfillActions);
                }
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
