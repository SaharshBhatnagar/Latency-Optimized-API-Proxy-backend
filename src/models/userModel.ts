import { connectDb } from '../config/database.js';
import bcrypt from 'bcrypt';

export interface User {
    id: number;
    username: string;
    email?: string | null;
    password_hash: string;
    reset_token?: string | null;
    reset_token_expires?: Date | null;
}

export async function initUserTable(): Promise<void> {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            reset_token VARCHAR(255),
            reset_token_expires TIMESTAMP
        );
    `;
    await connectDb(createTableQuery);

    const migrationQueries = [
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;`
    ];

    for (const migration of migrationQueries) {
        try {
            await connectDb(migration);
        } catch {
        }
    }

    const seedQuery = `
        INSERT INTO users (username, email, password_hash) 
        VALUES ($1, $2, $3)
        ON CONFLICT (username) DO NOTHING;
    `;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('adminpassword', saltRounds);

    await connectDb(seedQuery, ['superadmin', 'admin@saharshbhatnagar.app', hashedPassword]);
}

export async function findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
    const result = await connectDb(query, [email.trim()]);
    return result.rows.length > 0 ? (result.rows[0] as User) : null;
}

export async function findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE LOWER(username) = LOWER($1)';
    const result = await connectDb(query, [username.trim()]);
    return result.rows.length > 0 ? (result.rows[0] as User) : null;
}

export async function findByUsernameOrEmail(identifier: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)';
    const result = await connectDb(query, [identifier.trim()]);
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0] as User;
    if (!user.email && identifier.includes('@')) {
        try {
            await connectDb('UPDATE users SET email = $1 WHERE id = $2', [identifier.trim().toLowerCase(), user.id]);
            user.email = identifier.trim().toLowerCase();
        } catch {
        }
    }
    return user;
}

export async function findByResetToken(token: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()';
    const result = await connectDb(query, [token]);
    return result.rows.length > 0 ? (result.rows[0] as User) : null;
}

export async function savePasswordResetToken(identifier: string, resetToken: string, expireTime: Date): Promise<boolean> {
    const query = `
        UPDATE users 
        SET reset_token = $1, reset_token_expires = $2 
        WHERE LOWER(email) = LOWER($3) OR LOWER(username) = LOWER($3)
        RETURNING id
    `;
    const result = await connectDb(query, [resetToken, expireTime, identifier.trim()]);
    return result.rows.length > 0;
}

export async function updatePassword(userId: number, hashedPassword: string): Promise<boolean> {
    const query = `
        UPDATE users 
        SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL 
        WHERE id = $2 
        RETURNING id
    `;
    const result = await connectDb(query, [hashedPassword, userId]);
    return result.rows.length > 0;
}

export async function createUser(username: string, email: string, hashedPassword: string): Promise<{ id: number; username: string; email: string }> {
    const query = `
        INSERT INTO users (username, email, password_hash) 
        VALUES ($1, $2, $3) 
        RETURNING id, username, email
    `;
    const result = await connectDb(query, [username.trim(), email.trim(), hashedPassword]);
    return result.rows[0];
}