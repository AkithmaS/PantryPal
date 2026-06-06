import db from '../config/db.js';

const MAX_INLINE_IMAGE_LENGTH = 900000; // Increased to allow high-quality user images while still preventing extreme bloat

function sanitizeSummaryRecipe(recipe) {
    if (!recipe) {
        return recipe;
    }

    const imageUrl = recipe.image_url;

    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image/') && imageUrl.length > MAX_INLINE_IMAGE_LENGTH) {
        return {
            ...recipe,
            image_url: null
        };
    }

    return recipe;
}

class Recipe {
    static async create(userId, recipeData) {
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            const {
                title,
                name,
                description,
                ingredients = [],
                instructions,
                prep_time,
                cook_time,
                preparation_time,
                cooking_time,
                servings,
                dietary_tags,
                cuisine_type,
                difficulty,
                user_notes,
                image_url,
                nutrition,
                cooking_tips,
                cookingTips
            } = recipeData;

            const recipeName = name || title;
            const prepTime = preparation_time ?? prep_time;
            const cookTime = cooking_time ?? cook_time;
            const finalTips = cooking_tips || cookingTips || [];

            // Coerce times and servings to integers (DB expects INTEGER)
            const prepTimeInt = prepTime !== undefined && prepTime !== null ? Math.round(Number(prepTime)) : null;
            const cookTimeInt = cookTime !== undefined && cookTime !== null ? Math.round(Number(cookTime)) : null;
            const servingsInt = servings !== undefined && servings !== null ? Math.round(Number(servings)) : null;
            let instructionsJson = instructions;

            if (typeof instructionsJson === 'string') {
                try {
                    instructionsJson = JSON.parse(instructionsJson);
                } catch (error) {
                    throw new Error('Instructions must be valid JSON');
                }
            }

            if (instructionsJson === undefined || instructionsJson === null) {
                throw new Error('Instructions are required');
            }

            const instructionsPayload = JSON.stringify(instructionsJson);

            // Insert recipe
            const recipeResult = await client.query(
                `
                INSERT INTO recipes 
                (user_id, name, description, instructions, preparation_time, cooking_time, servings, dietary_tags, cuisine_type, difficulty, user_notes, image_url, cooking_tips)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
                `,
                [
                    userId,
                    recipeName,
                    description,
                    instructionsPayload,
                    prepTimeInt,
                    cookTimeInt,
                    servingsInt,
                    dietary_tags,
                    cuisine_type,
                    difficulty,
                    user_notes,
                    image_url,
                    finalTips
                ]
            );

            const recipe = recipeResult.rows[0];

            // Insert ingredients
            if (ingredients.length > 0) {
                for (const ingredient of ingredients) {
                    // Ensure quantity is an integer (DB column is INTEGER). Round floats, default to 1.
                    let qty = ingredient && ingredient.quantity !== undefined && ingredient.quantity !== null ? Number(ingredient.quantity) : NaN;
                    if (!Number.isFinite(qty) || isNaN(qty)) {
                        qty = 1;
                    }
                    const qtyInt = Math.round(qty);

                    await client.query(
                        `
                        INSERT INTO recipe_ingredients 
                        (recipe_id, ingredient_name, quantity, unit)
                        VALUES ($1, $2, $3, $4)
                        `,
                        [
                            recipe.id,
                            ingredient.name,
                            qtyInt,
                            ingredient.unit || ''
                        ]
                    );
                }
            }

            // Insert nutritional info (coerce/clean values)
            if (nutrition && Object.keys(nutrition).length > 0) {
                const parseNumber = (v) => {
                    if (v === undefined || v === null) return null;
                    if (typeof v === 'number' && Number.isFinite(v)) return v;
                    const s = String(v);
                    // Try direct Number
                    const n = Number(s);
                    if (!Number.isNaN(n)) return n;
                    // Extract first numeric token from string (e.g., "approx. 700 calories per serving")
                    const m = s.match(/[-+]?\d+(?:\.\d+)?/);
                    if (m) return Number(m[0]);
                    return null;
                };

                const caloriesVal = parseNumber(nutrition.calories);
                const carbsVal = parseNumber(nutrition.carbohydrates);
                const proteinVal = parseNumber(nutrition.protein);
                const fiberVal = parseNumber(nutrition.fiber);
                const fatVal = parseNumber(nutrition.fat);

                const caloriesInt = caloriesVal !== null && caloriesVal !== undefined ? Math.round(caloriesVal) : null;
                const carbsNum = carbsVal !== null && carbsVal !== undefined ? Number(Number(carbsVal).toFixed(2)) : null;
                const proteinNum = proteinVal !== null && proteinVal !== undefined ? Number(Number(proteinVal).toFixed(2)) : null;
                const fiberNum = fiberVal !== null && fiberVal !== undefined ? Number(Number(fiberVal).toFixed(2)) : null;
                const fatNum = fatVal !== null && fatVal !== undefined ? Number(Number(fatVal).toFixed(2)) : null;

                await client.query(
                    `
                    INSERT INTO recipe_nutrition 
                    (recipe_id, calories, carbohydrates, protein, fiber, fat)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    `,
                    [
                        recipe.id,
                        caloriesInt,
                        carbsNum,
                        proteinNum,
                        fiberNum,
                        fatNum
                    ]
                );
            }

            await client.query('COMMIT');

            // Fetch complete recipe
            return await this.findById(userId, recipe.id);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;

        } finally {
            client.release();
        }
    }

    // Get recipe by ID
    static async findById(userId, recipeId) {
        const recipeResult = await db.query(
            'SELECT * FROM recipes WHERE user_id = $1 AND id = $2',
            [userId, recipeId]
        );
        if (recipeResult.rows.length === 0) {
            return null;
        }
        const recipe = recipeResult.rows[0];

        //get ingredients
        const ingredientsResult = await db.query(
            'SELECT ingredient_name AS name, quantity, unit FROM recipe_ingredients WHERE recipe_id = $1',
            [recipe.id]
        );
        recipe.ingredients = ingredientsResult.rows;

        //get nutritional info
        const nutritionResult = await db.query(
            'SELECT * FROM recipe_nutrition WHERE recipe_id = $1',
            [recipe.id]
        );
        return {
            ...recipe,
        ingredients: ingredientsResult.rows,
            nutrition: nutritionResult.rows[0] || null
        };
    }

//get all recipes for a user with filters
    static async findAllByUserId(userId, filters = {}) {
        let query = 'SELECT * FROM recipes WHERE user_id = $1';
        const params = [userId];
        let paramCount = 1;

        if (filters.title || filters.name) {
            paramCount++;
            query += ` AND name ILIKE $${paramCount}`;
            params.push(`%${filters.title || filters.name}%`);
        }

        if (filters.cuisine_type || filters.cuisine) {
            paramCount++;
            query += ` AND cuisine_type = $${paramCount}`;
            params.push(filters.cuisine_type || filters.cuisine);
        }

        if (filters.difficulty) {
            paramCount++;
            query += ` AND difficulty = $${paramCount}`;
            params.push(filters.difficulty);
        }

        if (filters.dietary_tag || filters.dietary) {
            paramCount++;
            query += ` AND dietary_tags @> $${paramCount}::text[]`;
            params.push([filters.dietary_tag || filters.dietary]);
        }

        if (filters.max_prep_time || filters.maxCookingTime) {
            paramCount++;
            query += ` AND preparation_time <= $${paramCount}`;
            params.push(filters.max_prep_time || filters.maxCookingTime);
        }

    //sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    //pargination

    const limit = filters.limit ? parseInt(filters.limit) : 10;
    const offset = filters.page && filters.limit ? (parseInt(filters.page) - 1) * limit : 0;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
        const result = await db.query(query, params);
        return result.rows.map(sanitizeSummaryRecipe);
    }

    static async findRecentByUserId(userId, limit = 5) {
        try {
            const result = await db.query(
                'SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
                [userId, limit]
            );
            return (result.rows || []).map(sanitizeSummaryRecipe);
        } catch (error) {
            console.error('Error in findRecentByUserId model:', error);
            return [];
        }
    }

//update recipe
    static async update(userId, recipeId, updates) {
        const {
            title,
            name,
            description,
            instructions,
            ingredients,
            prep_time,
            cook_time,
            preparation_time,
            cooking_time,
            servings,
            image_url,
            dietary_tags,
            cuisine_type,
            difficulty,
            user_notes,
            cooking_tips,
            cookingTips
        } = updates;
        const finalTips = cooking_tips || cookingTips;
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            let instructionsPayload = null;

            if (instructions !== undefined && instructions !== null) {
                if (typeof instructions === 'string') {
                    try {
                        instructionsPayload = JSON.stringify(JSON.parse(instructions));
                    } catch (error) {
                        instructionsPayload = JSON.stringify([instructions]);
                    }
                } else {
                    instructionsPayload = JSON.stringify(instructions);
                }
            }

            const result = await client.query(
                `UPDATE recipes
                 SET name = COALESCE($1, name),
                     description = COALESCE($2, description),
                     instructions = COALESCE($3, instructions),
                     preparation_time = COALESCE($4, preparation_time),
                     cooking_time = COALESCE($5, cooking_time),
                     servings = COALESCE($6, servings),
                     image_url = COALESCE($7, image_url),
                     dietary_tags = COALESCE($8, dietary_tags),
                     cuisine_type = COALESCE($9, cuisine_type),
                     difficulty = COALESCE($10, difficulty),
                     user_notes = COALESCE($11, user_notes),
                     cooking_tips = COALESCE($12, cooking_tips)
                 WHERE user_id = $13 AND id = $14
                 RETURNING *`,
                [
                    name || title,
                    description,
                    instructionsPayload,
                    preparation_time ?? prep_time,
                    cooking_time ?? cook_time,
                    servings,
                    image_url,
                    dietary_tags,
                    cuisine_type,
                    difficulty,
                    user_notes,
                    finalTips,
                    userId,
                    recipeId
                ]
            );

            if (result.rows.length === 0) {
                throw new Error('Recipe not found');
            }

            if (ingredients !== undefined) {
                await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);

                if (Array.isArray(ingredients) && ingredients.length > 0) {
                    for (const ingredient of ingredients) {
                        const ingredientName = ingredient?.name ? String(ingredient.name).trim() : '';
                        if (!ingredientName) {
                            continue;
                        }

                        let qty = ingredient.quantity !== undefined && ingredient.quantity !== null ? Number(ingredient.quantity) : NaN;
                        if (!Number.isFinite(qty) || Number.isNaN(qty)) {
                            qty = 1;
                        }

                        await client.query(
                            `
                            INSERT INTO recipe_ingredients
                            (recipe_id, ingredient_name, quantity, unit)
                            VALUES ($1, $2, $3, $4)
                            `,
                            [
                                recipeId,
                                ingredientName,
                                Math.round(qty),
                                ingredient.unit || ''
                            ]
                        );
                    }
                }
            }

            await client.query('COMMIT');
            return await this.findById(userId, recipeId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    //delete recipe
    static async delete(userId, recipeId) {
        const result = await db.query(
            'DELETE FROM recipes WHERE user_id = $1 AND id = $2 RETURNING *',
            [userId, recipeId]
        );
        if (result.rows.length === 0) {
            throw new Error('Recipe not found');
        }
        return result.rows[0];
    }

    static async getStats(userId) {
        const result = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM recipes WHERE user_id = $1) AS total_recipes,
                (SELECT AVG(preparation_time) FROM recipes WHERE user_id = $1) AS avg_prep_time,
                (SELECT AVG(cooking_time) FROM recipes WHERE user_id = $1) AS avg_cook_time`,
            [userId]
        );
        return result.rows[0];
    }

    // Controller-friendly aliases
    static async getById(userId, recipeId) {
        return this.findById(userId, recipeId);
    }

    static async getAllByUserId(userId, filters = {}) {
        return this.findAllByUserId(userId, filters);
    }

    static async getRecentByUserId(userId, limit = 5) {
        return this.findRecentByUserId(userId, limit);
    }

    static async getStatsByUserId(userId) {
        return this.getStats(userId);
    }
}
export default Recipe;