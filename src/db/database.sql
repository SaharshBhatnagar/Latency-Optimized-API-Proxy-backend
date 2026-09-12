
CREATE DATABASE clouddb;

CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL
        )


INSERT INTO users (username, password_hash) 
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING;


SELECT * FROM users WHERE username = $1`;