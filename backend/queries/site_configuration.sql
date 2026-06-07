-- database: ./../u_tube_radio.db

CREATE TABLE site_configuration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'site_title',
    'U-Tube Radio | Discover Music by Mood'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'site_tagline',
    'Your Mood, Your Music'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'meta_description',
    'Discover music by mood, energy and time of day with curated radio-style streaming.'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'meta_keywords',
    'music,mood,music radio,youtube radio,party songs,chill music'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'meta_author',
    'Canishk'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'og_title',
    'U-Tube Radio | Discover Music by Mood'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'og_description',
    'Listen to curated music streams organized by mood and energy.'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'meta_description',
    'Discover music by mood, energy and time of day with curated radio-style streaming.'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'meta_keywords',
    'music,mood,music radio,youtube radio,party songs,chill music'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'meta_author',
    'Anish Karim'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'og_title',
    'U-Tube Radio | Discover Music by Mood'
);

INSERT INTO site_configuration
(config_key, config_value)
VALUES
(
    'og_description',
    'Listen to curated music streams organized by mood and energy.'
);