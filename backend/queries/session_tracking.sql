CREATE TABLE active_sessions (
    session_id TEXT PRIMARY KEY,
    current_song_id INTEGER,
    current_category_id VARCHAR,
    last_seen_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);