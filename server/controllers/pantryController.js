import pantryitem from '../models/Pantryitem.js';

// Get all pantry items
export const getPantryItems = async (req, res, next) => {
    try {
        const { category, isRunningLow, search } = req.query;

        const items = await pantryitem.getAllByUserId(req.user.id, {
            category,
            is_running_low:
                isRunningLow == 'true'
                    ? true
                    : isRunningLow == 'false'
                    ? false
                    : undefined,
            search
        });

        res.json({
            success: true,
            data: items
        });
    } catch (error) {
        next(error);
    }
};

// Get pantry stats
export const getPantryStats = async (req, res, next) => {
    try {
        const stats = await pantryitem.getStatsByUserId(req.user.id);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

// Get items expiring soon
export const getExpiringSoonItems = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 7;

        const items = await pantryitem.getExpiringSoon(
            req.user.id,
            days
        );

        res.json({
            success: true,
            data: items
        });
    } catch (error) {
        next(error);
    }
};

// Add pantry item
export const addPantryItem = async (req, res, next) => {
    try {
        const item = await pantryitem.create(
            req.user.id,
            req.body
        );

        res.status(201).json({
            success: true,
            data: item
        });
    } catch (error) {
        next(error);
    }
};

// Update pantry item
export const updatePantryItem = async (req, res, next) => {
    try {
        const itemId = parseInt(req.params.id);

        const item = await pantryitem.update(
            req.user.id,
            itemId,
            req.body
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Pantry item not found'
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        next(error);
    }
};

// Delete pantry item
export const deletePantryItem = async (req, res, next) => {
    try {
        const itemId = parseInt(req.params.id);

        const item = await pantryitem.delete(
            req.user.id,
            itemId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Pantry item not found'
            });
        }

        res.json({
            success: true,
            message: 'Pantry item deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};