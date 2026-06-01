import ShoppingList from '../models/ShoppingList.js';

//generate shopping list from meal plan
export const generateShoppingList = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }   

        const items = await ShoppingList.generateFromMealPlan(req.user.id, startDate, endDate);

        res.json({
            success: true,
            message: 'Shopping list generated successfully',
            data: items
        });
    } catch (error) {
        next(error);
    }
};


//get shopping list items

export const getShoppingListItems = async (req, res, next) => {
    try {
        const grouped = req.query.grouped === 'true';

        const items = grouped
            ? await ShoppingList.getGroupedByCategory(req.user.id)
            : await ShoppingList.getByUserId(req.user.id);

            res.json({
                success: true,
                data: items
            });
    } catch (error) {
        next(error);
    }
};

//add items to shopping list
export const addItem = async (req, res, next) => {
    try {
        const item = await ShoppingList.addItem(req.user.id, req.body);

        res.status(201).json({
            success: true,
            message: 'Item added to shopping list successfully',
            data: item
        });
    } catch (error) {
        next(error);
    }
};

//update shopping list item
export const updateItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await ShoppingList.updateItem(req.user.id, id, req.body);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.json({
            success: true,
            message: 'Item updated successfully',
            data: item
        });
    } catch (error) {
        next(error);
    }
};

//toggle item checked status
export const toggleChecked = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await ShoppingList.toggleChecked(req.user.id, id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.json({
            success: true,
            message: 'Item checked status toggled successfully',
            data: item
        });
    } catch (error) {
        next(error);
    }
};

//delete shopping list item
export const deleteItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await ShoppingList.deleteItem(req.user.id, id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }   
        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};

//clean checked items
export const clearChecked = async (req, res, next) => {
    try {
        await ShoppingList.clearChecked(req.user.id);
        res.json({
            success: true,
            message: 'Checked items cleaned successfully'
        });
    } catch (error) {
        next(error);
    }
};

//clear entire shopping list
export const clearAll = async (req, res, next) => {
    try {
        await ShoppingList.clearAll(req.user.id);
        res.json({
            success: true,
            message: 'Shopping list cleared successfully'
        });
    } catch (error) {
        next(error);
    }
};


//add checked items to pantry
export const addCheckedToPantry = async (req, res, next) => {
    try {
        const items = await ShoppingList.addCheckedToPantry(req.user.id);  
        res.json({
            success: true,
            message: 'Checked items added to pantry successfully',
            data: items
        });
    } catch (error) {      
        next(error);
    }
};

export const preflightAddToPantry = async (req, res, next) => {
    try {
        const { checkedItemIds } = req.body;

        if (!Array.isArray(checkedItemIds)) {
            return res.status(400).json({
                success: false,
                message: 'checkedItemIds must be an array'
            });
        }

        const result = await ShoppingList.preflightAddToPantry(req.user.id, checkedItemIds);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const confirmAddToPantry = async (req, res, next) => {
    try {
        const result = await ShoppingList.confirmAddToPantry(req.user.id, req.body);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

