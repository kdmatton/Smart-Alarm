CREATE TABLE Users (
    UserID   SERIAL PRIMARY KEY,
    Email    VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL
);

CREATE TABLE refresh_tokens (
    token_id   SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL UNIQUE REFERENCES Users(UserID) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    revoked    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE Alarms (
    alarm_id      SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    time          TEXT NOT NULL,
    is_enabled    BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_alarms_user_id ON Alarms(user_id);