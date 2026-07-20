/* =====================================================================
   ESPORTS TOURNAMENT ASSISTANCE - DATABASE SCHEMA (Microsoft SQL Server)
   Phiên bản: v2.0 - Cập nhật theo Implementation Plan
   Thay đổi chính:
     - Thêm phone_number, avatar_url vào users
     - Thêm bảng tournament_organizers (per-tournament role)
     - Thêm description, start_date, end_date, banner_url vào tournaments
     - Thêm is_active vào teams
     - Đổi admin_user_id → performed_by trong match_audit_logs
     - Thêm seed data BO3/BO5 cho draft_sequence_templates
   ===================================================================== */

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'EsportsTournamentDB')
BEGIN
    CREATE DATABASE EsportsTournamentDB;
END
GO

USE EsportsTournamentDB;
GO

/* =========================
   MODULE: IDENTITY
   ========================= */

CREATE TABLE users (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    username        NVARCHAR(50)  NOT NULL UNIQUE,
    email           NVARCHAR(255) NOT NULL UNIQUE,
    password_hash   NVARCHAR(255) NOT NULL,
    full_name       NVARCHAR(100) NULL,
    phone_number    NVARCHAR(20)  NULL,
    avatar_url      NVARCHAR(500) NULL,
    global_role     NVARCHAR(20)  NOT NULL
                    CONSTRAINT CK_users_global_role CHECK (global_role IN ('ADMIN','USER')),
    is_active       BIT NOT NULL DEFAULT 1,
    created_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE refresh_tokens (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    token_hash      NVARCHAR(255) NOT NULL,
    expires_at      DATETIME2 NOT NULL,
    revoked         BIT NOT NULL DEFAULT 0,
    created_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
);

/* =========================
   MODULE: TOURNAMENT
   ========================= */

CREATE TABLE teams (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(100) NOT NULL,
    tag             NVARCHAR(10) NULL,
    captain_id      BIGINT NOT NULL,
    logo_url        NVARCHAR(500) NULL,
    is_active       BIT NOT NULL DEFAULT 1,
    created_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_teams_captain FOREIGN KEY (captain_id) REFERENCES users(id)
);

CREATE TABLE team_members (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id         BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    in_game_name    NVARCHAR(100) NULL,
    status          NVARCHAR(20) NOT NULL
                    CONSTRAINT CK_team_members_status CHECK (status IN ('INVITED','ACCEPTED','REJECTED','REMOVED')),
    invited_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    responded_at    DATETIME2 NULL,
    CONSTRAINT FK_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id),
    CONSTRAINT FK_team_members_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT UQ_team_members UNIQUE (team_id, user_id)
);

CREATE TABLE tournaments (
    id                    BIGINT IDENTITY(1,1) PRIMARY KEY,
    name                  NVARCHAR(150) NOT NULL,
    description           NVARCHAR(MAX) NULL,
    format                NVARCHAR(5) NULL
                          CONSTRAINT CK_tournaments_format CHECK (format IS NULL OR format IN ('BO1','BO3','BO5')),
    max_teams             TINYINT NOT NULL
                          CONSTRAINT CK_tournaments_max_teams CHECK (max_teams IN (8,16,32)),
    rules_description     NVARCHAR(MAX) NULL,
    registration_status   NVARCHAR(20) NOT NULL
                          CONSTRAINT CK_tournaments_reg_status CHECK (registration_status IN ('OPEN','LOCKED','IN_PROGRESS','COMPLETED','CANCELLED')),
    start_date            DATETIME2 NULL,
    end_date              DATETIME2 NULL,
    banner_url            NVARCHAR(500) NULL,
    created_by            BIGINT NOT NULL,
    created_at            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_tournaments_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE tournament_organizers (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    tournament_id   BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    role            NVARCHAR(20) NOT NULL
                    CONSTRAINT CK_organizers_role CHECK (role IN ('OWNER','CO_ORGANIZER')),
    assigned_by     BIGINT NULL,
    created_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_organizers_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CONSTRAINT FK_organizers_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_organizers_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id),
    CONSTRAINT UQ_organizers UNIQUE (tournament_id, user_id)
);

CREATE TABLE tournament_registrations (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    tournament_id   BIGINT NOT NULL,
    team_id         BIGINT NOT NULL,
    status          NVARCHAR(20) NOT NULL
                    CONSTRAINT CK_registrations_status CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    registered_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    reviewed_at     DATETIME2 NULL,
    reviewed_by     BIGINT NULL,
    CONSTRAINT FK_registrations_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CONSTRAINT FK_registrations_team FOREIGN KEY (team_id) REFERENCES teams(id),
    CONSTRAINT FK_registrations_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT UQ_registrations UNIQUE (tournament_id, team_id)
);

CREATE TABLE matches (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    tournament_id       BIGINT NOT NULL,
    round_number        INT NOT NULL,
    position_in_round   INT NOT NULL,
    team1_id            BIGINT NULL,
    team2_id            BIGINT NULL,
    winner_team_id      BIGINT NULL,
    next_match_id       BIGINT NULL,
    next_match_slot     TINYINT NULL
                        CONSTRAINT CK_matches_next_slot CHECK (next_match_slot IN (1,2)),
    status              NVARCHAR(20) NOT NULL
                        CONSTRAINT CK_matches_status CHECK (status IN ('PENDING','DRAFTING','LIVE','COMPLETED','CANCELLED')),
    scheduled_time      DATETIME2 NOT NULL,
    score_team1         INT NOT NULL DEFAULT 0,
    score_team2         INT NOT NULL DEFAULT 0,
    is_locked           BIT NOT NULL DEFAULT 0,
    format              VARCHAR(255) NULL,
    created_at          DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_matches_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CONSTRAINT FK_matches_team1 FOREIGN KEY (team1_id) REFERENCES teams(id),
    CONSTRAINT FK_matches_team2 FOREIGN KEY (team2_id) REFERENCES teams(id),
    CONSTRAINT FK_matches_winner FOREIGN KEY (winner_team_id) REFERENCES teams(id),
    CONSTRAINT FK_matches_next_match FOREIGN KEY (next_match_id) REFERENCES matches(id)
);

CREATE INDEX IX_matches_tournament ON matches(tournament_id);
CREATE INDEX IX_matches_scheduler ON matches(status, scheduled_time);

/* =========================
   MODULE: DRAFTING
   ========================= */

CREATE TABLE maps (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    image_url   NVARCHAR(500) NULL,
    is_active   BIT NOT NULL DEFAULT 1
);

CREATE TABLE agents (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    role_type   NVARCHAR(50) NULL,
    image_url   NVARCHAR(500) NULL,
    is_active   BIT NOT NULL DEFAULT 1
);

CREATE TABLE draft_sequence_templates (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    format          NVARCHAR(5) NOT NULL
                    CONSTRAINT CK_sequence_format CHECK (format IN ('BO1','BO3','BO5')),
    step_number     INT NOT NULL,
    phase           NVARCHAR(10) NOT NULL
                    CONSTRAINT CK_sequence_phase CHECK (phase IN ('AGENT','MAP')),
    action_type     NVARCHAR(10) NOT NULL
                    CONSTRAINT CK_sequence_action CHECK (action_type IN ('BAN','PICK')),
    turn_order      TINYINT NOT NULL
                    CONSTRAINT CK_sequence_turn CHECK (turn_order IN (1,2)),
    CONSTRAINT UQ_sequence UNIQUE (format, step_number)
);

CREATE TABLE match_draft_states (
    match_id                BIGINT PRIMARY KEY,
    current_step_number     INT NULL,
    current_turn_team_id    BIGINT NULL,
    turn_deadline_at        DATETIME2 NULL,
    draft_status            NVARCHAR(20) NOT NULL
                            CONSTRAINT CK_draft_state_status CHECK (draft_status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
    updated_at              DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_draft_state_match FOREIGN KEY (match_id) REFERENCES matches(id),
    CONSTRAINT FK_draft_state_team FOREIGN KEY (current_turn_team_id) REFERENCES teams(id)
);

CREATE TABLE draft_actions (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    match_id        BIGINT NOT NULL,
    step_number     INT NOT NULL,
    phase           NVARCHAR(10) NOT NULL CONSTRAINT CK_draft_action_phase CHECK (phase IN ('AGENT','MAP')),
    action_type     NVARCHAR(10) NOT NULL CONSTRAINT CK_draft_action_type CHECK (action_type IN ('BAN','PICK')),
    team_id         BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    map_id          BIGINT NULL,
    agent_id        BIGINT NULL,
    is_auto         BIT NOT NULL DEFAULT 0,
    created_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_draft_actions_match FOREIGN KEY (match_id) REFERENCES matches(id),
    CONSTRAINT FK_draft_actions_team FOREIGN KEY (team_id) REFERENCES teams(id),
    CONSTRAINT FK_draft_actions_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_draft_actions_map FOREIGN KEY (map_id) REFERENCES maps(id),
    CONSTRAINT FK_draft_actions_agent FOREIGN KEY (agent_id) REFERENCES agents(id),
    CONSTRAINT CK_draft_action_target CHECK ((map_id IS NOT NULL AND agent_id IS NULL) OR (map_id IS NULL AND agent_id IS NOT NULL))
);

CREATE INDEX IX_draft_actions_match ON draft_actions(match_id, step_number);

/* =========================
   AUDIT: SCORE CORRECTION / ROLLBACK
   ========================= */

CREATE TABLE match_audit_logs (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    match_id        BIGINT NOT NULL,
    performed_by    BIGINT NOT NULL,
    action_type     NVARCHAR(20) NOT NULL
                    CONSTRAINT CK_audit_action_type CHECK (action_type IN ('SCORE_SUBMIT','SCORE_CORRECTION','ROLLBACK')),
    old_value       NVARCHAR(MAX) NULL,
    new_value       NVARCHAR(MAX) NULL,
    reason          NVARCHAR(500) NULL,
    created_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_audit_match FOREIGN KEY (match_id) REFERENCES matches(id),
    CONSTRAINT FK_audit_performed_by FOREIGN KEY (performed_by) REFERENCES users(id)
);

/* =====================================================================
   SEED DATA: draft_sequence_templates
   ===================================================================== */

-- BO1: 2 Agent Ban + 4 Map Ban (ban hết còn 1 map cuối cùng)
INSERT INTO draft_sequence_templates (format, step_number, phase, action_type, turn_order) VALUES
('BO1', 1, 'AGENT', 'BAN', 1),
('BO1', 2, 'AGENT', 'BAN', 2),
('BO1', 3, 'MAP', 'BAN', 1),
('BO1', 4, 'MAP', 'BAN', 2),
('BO1', 5, 'MAP', 'BAN', 1),
('BO1', 6, 'MAP', 'BAN', 2);

-- BO3: 2 Agent Ban + Map Ban/Pick (2 pick + 2 ban + 1 decider)
INSERT INTO draft_sequence_templates (format, step_number, phase, action_type, turn_order) VALUES
('BO3', 1,  'AGENT', 'BAN',  1),
('BO3', 2,  'AGENT', 'BAN',  2),
('BO3', 3,  'MAP',   'BAN',  1),
('BO3', 4,  'MAP',   'BAN',  2),
('BO3', 5,  'MAP',   'PICK', 1),
('BO3', 6,  'MAP',   'PICK', 2),
('BO3', 7,  'MAP',   'BAN',  1),
('BO3', 8,  'MAP',   'BAN',  2);

-- BO5: 2 Agent Ban + Map Ban/Pick (4 pick + 2 ban + 1 decider)
INSERT INTO draft_sequence_templates (format, step_number, phase, action_type, turn_order) VALUES
('BO5', 1,  'AGENT', 'BAN',  1),
('BO5', 2,  'AGENT', 'BAN',  2),
('BO5', 3,  'MAP',   'PICK', 1),
('BO5', 4,  'MAP',   'PICK', 2),
('BO5', 5,  'MAP',   'BAN',  1),
('BO5', 6,  'MAP',   'BAN',  2),
('BO5', 7,  'MAP',   'PICK', 1),
('BO5', 8,  'MAP',   'PICK', 2);

-- Seed data: Valorant Maps
INSERT INTO maps (name, is_active) VALUES
('Ascent', 1), ('Bind', 1), ('Haven', 1), ('Split', 1),
('Icebox', 1), ('Breeze', 1), ('Fracture', 1), ('Pearl', 1),
('Lotus', 1), ('Sunset', 1), ('Abyss', 1);

-- Seed data: Valorant Agents
INSERT INTO agents (name, role_type, is_active) VALUES
('Jett',      'Duelist',     1),
('Phoenix',   'Duelist',     1),
('Reyna',     'Duelist',     1),
('Raze',      'Duelist',     1),
('Yoru',      'Duelist',     1),
('Neon',      'Duelist',     1),
('Iso',       'Duelist',     1),
('Sage',      'Sentinel',    1),
('Cypher',    'Sentinel',    1),
('Killjoy',   'Sentinel',    1),
('Chamber',   'Sentinel',    1),
('Deadlock',  'Sentinel',    1),
('Vyse',      'Sentinel',    1),
('Sova',      'Initiator',   1),
('Breach',    'Initiator',   1),
('Skye',      'Initiator',   1),
('KAY/O',     'Initiator',   1),
('Fade',      'Initiator',   1),
('Gekko',     'Initiator',   1),
('Brimstone', 'Controller',  1),
('Viper',     'Controller',  1),
('Omen',      'Controller',  1),
('Astra',     'Controller',  1),
('Harbor',    'Controller',  1),
('Clove',     'Controller',  1);