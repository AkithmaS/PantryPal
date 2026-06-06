import db from '../config/db.js';
import { normalize } from '../utils/normalize.js';

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function buildExpiryValue(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

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
        const {name, quantity, unit} = itemData;
        const category = itemData.category || 'Other';
        const safeQuantity = Number.isFinite(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 1;
        const result = await db.query(
            `INSERT INTO shopping_list_items (user_id, ingredient_name, quantity, unit, category, is_checked, from_meal_plan) 
             VALUES ($1, $2, $3, $4, $5, false, false) RETURNING *`,
            [userId, name, safeQuantity, unit, category]
        );
        return {
            ...result.rows[0],
            name: result.rows[0].ingredient_name,
            category: result.rows[0].category,
        };
    }

    //get all shopping list items for a user
    static async getByUserId(userId) {
        const result = await db.query(
            `SELECT
                id,
                user_id,
                ingredient_name AS name,
                quantity,
                unit,
                     category,
                is_checked,
                from_meal_plan,
                created_at,
                updated_at
             FROM shopping_list_items
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    static async getByIds(userId, itemIds) {
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return [];
        }

        const result = await db.query(
            `SELECT
                id,
                user_id,
                ingredient_name AS name,
                quantity,
                unit,
                     category,
                is_checked,
                from_meal_plan,
                created_at,
                updated_at
             FROM shopping_list_items
             WHERE user_id = $1 AND id = ANY($2::uuid[])`,
            [userId, itemIds]
        );
        return result.rows;
    }

    static async getPantryItemsByUserId(userId) {
        const result = await db.query(
            `SELECT id, name, quantity, unit, expiration_date FROM pantry_items WHERE user_id = $1`,
            [userId]
        );
        return result.rows;
    }

    static async preflightAddToPantry(userId, checkedItemIds) {
        const itemIds = Array.isArray(checkedItemIds) ? [...new Set(checkedItemIds)].filter(Boolean) : [];

        if (itemIds.length === 0) {
            return { clean: [], conflicts: [] };
        }

        const [shoppingItems, pantryItems] = await Promise.all([
            this.getByIds(userId, itemIds),
            this.getPantryItemsByUserId(userId),
        ]);

        const pantryMap = new Map(
            pantryItems.map((item) => [normalize(item.name), item])
        );

        const clean = [];
        const conflicts = [];

        for (const item of shoppingItems) {
            const pantryMatch = pantryMap.get(normalize(item.name));

            if (pantryMatch) {
                conflicts.push({
                    shoppingItem: {
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        unit: item.unit,
                        category: item.category,
                    },
                    existingPantryItem: {
                        id: pantryMatch.id,
                        name: pantryMatch.name,
                        quantity: pantryMatch.quantity,
                        unit: pantryMatch.unit,
                        expiryDate: pantryMatch.expiration_date,
                    },
                });
            } else {
                clean.push({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    category: item.category || 'Other',
                });
            }
        }

        return { clean, conflicts };
    }

    static async confirmAddToPantry(userId, payload) {
        const clean = Array.isArray(payload?.clean) ? payload.clean : [];
        const decisions = Array.isArray(payload?.decisions) ? payload.decisions : [];

        const normalizedClean = clean.map((item) => ({
            ...item,
            shoppingItemId: item.shoppingItemId ?? item.id,
        }));

        const allShoppingIds = [
            ...normalizedClean.map((item) => item.shoppingItemId),
            ...decisions.map((decision) => decision.shoppingItemId),
        ].filter(Boolean);

        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            const resolvedShoppingItems = allShoppingIds.length > 0
                ? await this.getByIds(userId, allShoppingIds)
                : [];

            const resolvedShoppingMap = new Map(
                resolvedShoppingItems.map((item) => [item.id, item])
            );

            let added = 0;
            let merged = 0;

            for (const item of normalizedClean) {
                const shoppingItem = resolvedShoppingMap.get(item.shoppingItemId) || item;
                await client.query(
                    `INSERT INTO pantry_items (user_id, name, quantity, unit, category, expiration_date, is_running_low)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        userId,
                        shoppingItem.name,
                        toNumber(shoppingItem.quantity, 1),
                        shoppingItem.unit || '',
                        shoppingItem.category || 'Other',
                        buildExpiryValue(item.newExpiry),
                        false,
                    ]
                );
                added += 1;
            }

            for (const decision of decisions) {
                const shoppingItem = resolvedShoppingMap.get(decision.shoppingItemId);

                if (!shoppingItem) {
                    continue;
                }

                if (decision.action === 'merge') {
                    const pantryResult = await client.query(
                        `SELECT id, quantity, expiration_date FROM pantry_items WHERE user_id = $1 AND id = $2 FOR UPDATE`,
                        [userId, decision.existingPantryId]
                    );

                    const pantryItem = pantryResult.rows[0];

                    if (!pantryItem) {
                        continue;
                    }

                    const nextQuantity = toNumber(pantryItem.quantity, 0) + toNumber(decision.mergeQuantity ?? shoppingItem.quantity, 0);
                    const nextExpiry = buildExpiryValue(decision.mergeExpiry) ?? pantryItem.expiration_date;

                    await client.query(
                        `UPDATE pantry_items
                         SET quantity = $1,
                             expiration_date = $2
                         WHERE user_id = $3 AND id = $4`,
                        [nextQuantity, nextExpiry, userId, decision.existingPantryId]
                    );
                    merged += 1;
                } else {
                    await client.query(
                        `INSERT INTO pantry_items (user_id, name, quantity, unit, category, expiration_date, is_running_low)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            userId,
                            shoppingItem.name,
                            toNumber(shoppingItem.quantity, 1),
                            shoppingItem.unit || '',
                            shoppingItem.category || 'Other',
                            buildExpiryValue(decision.newExpiry),
                            false,
                        ]
                    );
                    added += 1;
                }
            }

            if (allShoppingIds.length > 0) {
                await client.query(
                    `DELETE FROM shopping_list_items WHERE user_id = $1 AND id = ANY($2::uuid[])`,
                    [userId, allShoppingIds]
                );
            }

            await client.query('COMMIT');

            return { success: true, added, merged };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    //get shopping list grouped by category
    static async getGroupedByCategory(userId) {
        const result = await db.query(
            `SELECT category, json_agg(json_build_object('id', id, 'name', ingredient_name, 'quantity', quantity, 'unit', unit, 'source', CASE WHEN from_meal_plan THEN 'meal_plan' ELSE 'manual' END)) AS items 
             FROM shopping_list_items
             WHERE user_id = $1 
             GROUP BY category
             ORDER BY category`,
            [userId]
        );
        return result.rows;
    }

    //update shopping list items
    static async updateItem(userId, itemId, itemData) {
        const {name, quantity, unit, category} = itemData;
        const result = await db.query(
            `UPDATE shopping_list_items SET ingredient_name = $1, quantity = $2, unit = $3, category = $4 
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
        const result = await db.query(
            `SELECT id FROM shopping_list_items WHERE user_id = $1 AND is_checked = true`,
            [userId]
        );

        const preflight = await this.preflightAddToPantry(
            userId,
            result.rows.map((row) => row.id)
        );

        const decisions = preflight.conflicts.map((conflict) => ({
            shoppingItemId: conflict.shoppingItem.id,
            existingPantryId: conflict.existingPantryItem.id,
            action: 'merge',
            updateExpiry: false,
            newExpiry: null,
        }));

        return await this.confirmAddToPantry(userId, {
            clean: preflight.clean,
            decisions,
        });
    }
}

export default ShoppingList;