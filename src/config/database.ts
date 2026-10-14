import { Pool } from 'pg';
import 'dotenv/config';

const isRds = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('rds.amazonaws.com') || process.env.DATABASE_URL.includes('sslmode=') || process.env.NODE_ENV === 'production');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isRds ? { rejectUnauthorized: false } : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    maxLifetimeSeconds: 60,
});

export const connectDb = (sqlText: string, params?: any[]) => {
    return pool.query(sqlText, params);
}