import db from '../config/db.js';

class ShoppingList {

    //generate shopping list from meal plan

    static async generateFromMealPlan(userId, startDate, endDate) {
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

        //clear previous generated meal plan based items
        await client.query(
            `DELETE FROM shopping_list_items 
             WHERE user_id = $1 AND source = 'meal_plan'`,
            [userId]
        );
        //get all ingredinets from meal plan recipes
        const result = await client.query(
            `SELECT i.name, i.quantity, i.unit FROM meal_plans mp 
             JOIN recipes r ON mp.recipe_id = r.id 
             JOIN ingredients i ON r.id = i.recipe_id 
             WHERE mp.user_id = $1 AND mp.meal_date BETWEEN $2 AND $3`,
            [userId, startDate, endDate]
        );

        //get pantry items to subtract
        const pantryResult = await client.query(
            `SELECT name, quantity, unit FROM pantry_items WHERE user_id = $1`,
            [userId]
        );

        const pantryMap = new Map();
        pantryResult.rows.forEach(item => {
            pantryMap.set(item.name.toLowerCase(), { quantity: item.quantity, unit: item.unit });
        });

        //insert shopping list items, subtracting pantry quantities
        for(const ing of ingredients){
            const key = `${ing.name.toLowerCase()}_${ing.unit.toLowerCase()}`;
            const pantryQuantity = pantryMap.get(key)?.quantity || 0;
            const neededQuantity = Math.max(ing.quantity - pantryQuantity, 0);

            if(neededQuantity > 0) {
                await client.query(
                    `INSERT INTO shopping_list_items (user_id, name, quantity, unit, source) 
                     VALUES ($1, $2, $3, $4, 'meal_plan')`,
                    [userId, ing.name, neededQuantity, ing.unit, 'uncategorized']
                );
            }
        }
        await client.query('COMMIT');

        return await this.getByUserId(userId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally { 
            client.release();
        }
    }

    //manually add item to shopping list
    static async addItem(userId, itemData) {
        const {name, quantity, unit, category = 'uncategorized'} = itemData;
        const result = await db.query(
            `INSERT INTO shopping_list_items (user_id, name, quantity, unit, category, source) 
             VALUES ($1, $2, $3, $4, $5, 'manual') RETURNING *`,
            [userId, name, quantity, unit, category]
        );
        return result.rows[0];
    }

    //get all shopping list items for a user
    static async getByUserId(userId) {
        const result = await db.query(
            `SELECT * FROM shopping_list_items WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    //get shopping list grouped by category
    static async getGroupedByCategory(userId) {
        const result = await db.query(
            `SELECT category, json_agg(json_build_object('id', id, 'name', name, 'quantity', quantity, 'unit', unit, 'source', source)) AS items 
             FROM shopping_list_items
             WHERE user_id = $1 
             GROUP BY category`,
            [userId]
        );
        return result.rows;
    }

    //update shopping list items
    static async updateItem(userId, itemId, itemData) {
        const {name, quantity, unit, category} = itemData;
        const result = await db.query(
            `UPDATE shopping_list_items SET name = $1, quantity = $2, unit = $3, category = $4 
             WHERE user_id = $5 AND id = $6 RETURNING *`,
            [name, quantity, unit, category, userId, itemId]
        );
        return result.rows[0];
    }

    //toggle item checked status
    static async toggleChecked(userId, itemId) {
        const result = await db.query(
            `UPDATE shopping_list_items SET is_checked = NOT is_checked 
             WHERE user_id = $1 AND id = $2 RETURNING *`,
            [userId, itemId]
        );
        return result.rows[0];
    }

    //delete shopping list item
    static async deleteItem(userId, itemId) {
        const result = await db.query(
            `DELETE FROM shopping_list_items WHERE user_id = $1 AND id = $2 RETURNING *`,
            [userId, itemId]
        );
        return result.rows[0];
    }

    //clear all checked items
    static async clearChecked(userId) {
        const result = await db.query(
            `DELETE FROM shopping_list_items WHERE user_id = $1 AND is_checked = true RETURNING *`,
            [userId]
        );
        return result.rows;
    }

    //clear entire shopping list
    static async clearAll(userId) {
        const result = await db.query(
            `DELETE FROM shopping_list_items WHERE user_id = $1 RETURNING *`,
            [userId]
        );
        return result.rows;
    }

    //add checked items directly to pantry
    static async addCheckedToPantry(userId) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');    

            //get checked items
            const result = await client.query(
                `SELECT name, quantity, unit FROM shopping_list_items 
                 WHERE user_id = $1 AND is_checked = true`,
                [userId]
            );
            //add to pantry
            for(const item of result.rows) {
                await client.query(
                    `INSERT INTO pantry_items (user_id, name, quantity, unit, category, expiry_date) 
                     VALUES ($1, $2, $3, $4, 'uncategorized', NULL)`,
                    [userId, item.name, item.quantity, item.unit]
                );
            }
            //delete checked items from shopping list
            await client.query(
                `DELETE FROM shopping_list_items WHERE user_id = $1 AND is_checked = true`,
                [userId]
            );
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}

export default ShoppingList;