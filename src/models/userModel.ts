import { connectDb } from '../config/database.js';
import bcrypt from 'bcrypt';

export async function initUserTable() {
    const table = `Create Table IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL
      )
     `;
    await connectDb(table);

    const seedQuery = `
        INSERT INTO users (username, password_hash) 
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING;
    `;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('adminpassword', saltRounds);

    await connectDb(seedQuery, ['superadmin', hashedPassword]);

    console.log("Database table verified and connected");
}