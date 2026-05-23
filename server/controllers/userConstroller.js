import User from '../models/User.js';
import UserPreferences from '../models/UserPreferences.js';

// Get User Profile
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const preferences = await UserPreferences.findByUserId(req.user.id);

        res.json({
            success: true,
            data: {
                user,
                preferences
            }
        });

    } catch (error) {
        next(error);
    }
};

// Update Profile
export const updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        const user = await User.update(req.user.id, { name, email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        next(error);
    }
};

// Update Preferences
export const updatePreferences = async (req, res, next) => {
    try {
        const preferences = await UserPreferences.upsert(req.user.id, req.body);

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: { preferences }
        });

    } catch (error) {
        next(error);
    }
};

// Change Password
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Current and new password are required'
            });
        }

        // Verify current password
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await User.verifyPassword(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            });
        }

        // Update password
        await User.updatePassword(req.user.id, newPassword);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        next(error);
    }
};

// Delete Account
export const deleteAccount = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await UserPreferences.deleteByUserId(req.user.id);
        await User.delete(req.user.id);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};