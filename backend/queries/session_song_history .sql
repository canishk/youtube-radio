CREATE TABLE session_song_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(255) NOT NULL,
    song_id INTEGER NOT NULL,
    category_id VARCHAR(255),
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(song_id) REFERENCES songs(id)
);