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

CREATE TABLE alarms (
    alarm_id     SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    alarm_time   TIME(0) NOT NULL,
    day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_enabled   BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT alarms_user_time_dow_key UNIQUE (user_id, alarm_time, day_of_week)
);
