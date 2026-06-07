PRAGMA foreign_keys = OFF;
BEGIN;
CREATE TABLE `categories_tmp` (
	id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	description VARCHAR, 
	thumbnail VARCHAR, 
	auto_mode VARCHAR,
	enabled BOOLEAN DEFAULT TRUE,
	PRIMARY KEY (id)
);
INSERT INTO `categories_tmp` (`id`, `name`, `description`, `thumbnail`, `auto_mode`) SELECT `id`, `name`, `description`, `thumbnail`, `auto_mode` FROM `categories`;
DROP TABLE `categories`;
ALTER TABLE `categories_tmp` RENAME TO `categories`;
CREATE INDEX ix_categories_id ON categories (id);
COMMIT;
PRAGMA foreign_keys = ON;