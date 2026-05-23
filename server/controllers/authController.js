import User from '../models/User.js';
import UserPreferences from '../models/UserPreferences.js';
import jwt from 'jsonwebtoken';

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

// Reset Password
export const resetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        await User.findByEmail(email);

        // Normally send email here

        res.json({
            success: true,
            message:
                'If an account with that email exists, a password reset link has been sent'
        });

    } catch (error) {
        next(error);
    }
};