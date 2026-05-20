import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userConstroller.js';
import authMiddleware from '../middleware/auth.js';

//all routes here are protected
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/preferences', authMiddleware, userController.updatePreferences);
router.put('/password', authMiddleware, userController.changePassword);
router.delete('/delete', authMiddleware, userController.deleteAccount);

export default router;