import { type Request, type Response } from 'express';
import { connectDb } from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function login(req: Request, res: Response) {

    const { username, password } = req.body;

    try {
        const users = `SELECT * FROM users WHERE username = $1`;

        const result = await connectDb(users, [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid Credentials"})
        }

        const isMatch = await bcrypt.compare(password, result.rows[0].password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        const payload = {
            id: result.rows[0].id,
            username: result.rows[0].username
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET as string,  { expiresIn: '1h'});

        res.status(200).json({ token });
    } 
    catch (err) {
        res.status(500).json({ error: "Internal server error"})
    }

}

export async function register(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const checkUserQuery = 'SELECT * FROM users WHERE username = $1';
        const existingUser = await connectDb(checkUserQuery, [username]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: "Username already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const insertQuery = `
            INSERT INTO users (username, password_hash) 
            VALUES ($1, $2) 
            RETURNING id, username
        `;
        const newUser = await connectDb(insertQuery, [username, hashedPassword]);

        const payload = {
            id: newUser.rows[0].id,
            username: newUser.rows[0].username
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function resetPassword(req: Request, res: Response) {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
        return res.status(400).json({ error: "Username and new password are required" });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const updateQuery = `
            UPDATE users 
            SET password_hash = $1 
            WHERE username = $2 
            RETURNING id
        `;
        const result = await connectDb(updateQuery, [hashedPassword, username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
}