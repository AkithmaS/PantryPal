import User from '../models/User.js';
import UserPreferences from '../models/UserPreferences.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../config/db.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
};

// Signup User
export const signup = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        // Check existing user
        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                message: 'Email already in use'
            });
        }

        // Create user
        const user = await User.create(name, email, password);

        // Create default preferences
        await UserPreferences.upsert(user.id, {
            dietary_restrictions: [],
            allergies: [],
            preffered_cuisines: [],
            default_serving_size: 4,
            measurement_units: 'metric'
        });

        // Generate token
        const token = generateToken(user);

        // Response
        res.status(201).json({
            success: true,
            message: 'User signed up successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
};

// Login User
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordMatch = await User.verifyPassword(password, user.password_hash);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user);

        // Response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get Current User
export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// Request Password Reset — sends email with a one-time link
export const resetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findByEmail(email);

        // Always respond the same way to prevent email enumeration
        const genericResponse = {
            success: true,
            message: 'If an account with that email exists, a reset link has been sent.',
        };

        if (!user) {
            return res.json(genericResponse);
        }

        // Invalidate any existing unused tokens for this user
        await db.query(
            `UPDATE password_reset_tokens SET used = TRUE
             WHERE user_id = $1 AND used = FALSE`,
            [user.id]
        );

        // Create a secure random token (64 hex chars)
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
            [user.id, token, expiresAt]
        );

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
        await sendPasswordResetEmail(user.email, resetLink);

        return res.json(genericResponse);
    } catch (error) {
        next(error);
    }
};

// Confirm Password Reset — validates token and sets the new password
export const resetPasswordConfirm = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters.' });
        }

        const result = await db.query(
            `SELECT * FROM password_reset_tokens
             WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
            [token]
        );

        const resetToken = result.rows[0];

        if (!resetToken) {
            return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
        }

        await User.updatePassword(resetToken.user_id, newPassword);

        // Mark token as used
        await db.query(
            `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`,
            [resetToken.id]
        );

        return res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        next(error);
    }
};