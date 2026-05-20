import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

// public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/request-password-reset', authController.resetPassword);

// protected routes
router.get('/profile', authMiddleware, authController.getCurrentUser);

export default router;
