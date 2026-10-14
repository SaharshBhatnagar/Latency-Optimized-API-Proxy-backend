import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import {
    findByUsername,
    findByUsernameOrEmail,
    findByResetToken,
    savePasswordResetToken,
    updatePassword,
    createUser
} from '../models/userModel.js';

export async function login(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const user = await findByUsernameOrEmail(username);

        if (!user) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        const payload = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        return res.status(200).json({ 
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function register(req: Request, res: Response) {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address format" });
    }

    try {
        const existingUsername = await findByUsername(username);
        if (existingUsername) {
            return res.status(409).json({ error: "Username already exists" });
        }

        const existingEmail = await findByUsernameOrEmail(email);
        if (existingEmail && existingEmail.email === email.trim().toLowerCase()) {
            return res.status(409).json({ error: "Email is already registered" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await createUser(username, email, hashedPassword);

        const payload = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        return res.status(201).json({ 
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function forgotPassword(req: Request, res: Response) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email address is required." });
        }

        const checkUser = await findByUsernameOrEmail(email);
        if (!checkUser) {
            return res.status(404).json({ error: "No account found with this email." });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expireTime = new Date(Date.now() + 3600000);

        await savePasswordResetToken(email, resetToken, expireTime);

        const baseUrl = process.env.FRONTEND_URL || 'https://proxy.saharshbhatnagar.app';
        const resetLink = `${baseUrl}/?token=${resetToken}`;
        const targetEmail = checkUser.email || email;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            return res.status(200).json({ 
                message: "Password reset link generated (Check server logs in development mode).",
                devLink: process.env.NODE_ENV !== 'production' ? resetLink : undefined
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        const mailOptions = {
            from: `"Latency-Optimized API Proxy" <${process.env.EMAIL_USER}>`,
            to: targetEmail,
            subject: 'Latency-Optimized API Proxy - Secure Password Reset',
            text: `Hello ${checkUser.username},\n\nYou requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #467cdf; margin-bottom: 8px;">Password Reset Request</h2>
                    <p style="font-size: 14px; color: #64748b;">Latency-Optimized API Proxy System</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                    <p>Hello <b>${checkUser.username}</b>,</p>
                    <p>We received a request to reset your password for your Latency-Optimized API Proxy account.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #467cdf; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="font-size: 0.9em; color: #666;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${resetLink}" style="color: #467cdf; word-break: break-all;">${resetLink}</a>
                    </p>
                    
                    <p style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #ef4444; margin-top: 24px; font-size: 0.85em; color: #475569;">
                        <b>Security Notice:</b> This link will expire in 1 hour. If you did not request a password reset, please ignore this email or review your account credentials.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Password reset link sent to your email." });
    } catch {
        return res.status(500).json({ error: "Failed to send email. Check server configuration." });
    }
}

export async function resetPassword(req: Request, res: Response) {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: "Missing token or new password." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        const user = await findByResetToken(token);
        if (!user) {
            return res.status(400).json({ error: "Invalid or expired password reset token." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await updatePassword(user.id, hashedPassword);

        return res.status(200).json({ message: "Password updated successfully. You can now log in." });
    } catch {
        return res.status(500).json({ error: "Server error while resetting password." });
    }
}