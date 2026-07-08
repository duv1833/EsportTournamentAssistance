/* =====================================================================
   ESPORTS TOURNAMENT ASSISTANCE - DATABASE SCHEMA (Microsoft SQL Server)
   Phiên bản: v1.1 - Đã tối ưu hóa kết nối cho Spring Data JPA
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
    created_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_teams_captain FOREIGN KEY (captain_id) REFERENCES users(id)
);

CREATE TABLE team_members (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id         BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
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
    format                NVARCHAR(5) NOT NULL
                          CONSTRAINT CK_tournaments_format CHECK (format IN ('BO1','BO3','BO5')),
    max_teams             TINYINT NOT NULL
                          CONSTRAINT CK_tournaments_max_teams CHECK (max_teams IN (8,16,32)),
    rules_description     NVARCHAR(MAX) NULL,
    registration_status   NVARCHAR(20) NOT NULL
                          CONSTRAINT CK_tournaments_reg_status CHECK (registration_status IN ('OPEN','LOCKED','IN_PROGRESS','COMPLETED','CANCELLED')),
    created_by            BIGINT NOT NULL,
    created_at            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_tournaments_creator FOREIGN KEY (created_by) REFERENCES users(id)
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
    admin_user_id   BIGINT NOT NULL,
    action_type     NVARCHAR(20) NOT NULL
                    CONSTRAINT CK_audit_action_type CHECK (action_type IN ('SCORE_SUBMIT','SCORE_CORRECTION','ROLLBACK')),
    old_value       NVARCHAR(MAX) NULL,
    new_value       NVARCHAR(MAX) NULL,
    reason          NVARCHAR(500) NULL,
    created_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_audit_match FOREIGN KEY (match_id) REFERENCES matches(id),
    CONSTRAINT FK_audit_admin FOREIGN KEY (admin_user_id) REFERENCES users(id)
);

/* =====================================================================
   SEED DATA MẪU: draft_sequence_templates (Thể thức BO1)
   ===================================================================== */

INSERT INTO draft_sequence_templates (format, step_number, phase, action_type, turn_order) VALUES
('BO1', 1, 'AGENT', 'BAN', 1),
('BO1', 2, 'AGENT', 'BAN', 2),
('BO1', 3, 'MAP', 'BAN', 1),
('BO1', 4, 'MAP', 'BAN', 2),
('BO1', 5, 'MAP', 'BAN', 1),
('BO1', 6, 'MAP', 'BAN', 2);