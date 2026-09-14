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