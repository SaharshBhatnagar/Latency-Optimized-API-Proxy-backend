CREATE DATABASE clouddb;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1);

INSERT INTO users (username, email, password_hash) 
VALUES ($1, $2, $3) 
RETURNING id, username, email;

UPDATE users 
SET reset_token = $1, reset_token_expires = $2 
WHERE LOWER(email) = LOWER($3) OR LOWER(username) = LOWER($3)
RETURNING id;

UPDATE users 
SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL 
WHERE id = $2 
RETURNING id;