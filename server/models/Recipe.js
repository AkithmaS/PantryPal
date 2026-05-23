import db from '../config/db.js';

class Recipe {
    static async create(userId, recipeData) {
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const {
                title,
                ingredients = [],
                instructions,
                prep_time,
                cook_time,
                servings,
                image_url,
                nutrition
            } = recipeData;

            // Insert recipe
            const recipeResult = await client.query(
                `
                INSERT INTO recipes 
                (user_id, title, instructions, prep_time, cook_time, servings, image_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
                `,
                [
                    userId,
                    title,
                    instructions,
                    prep_time,
                    cook_time,
                    servings,
                    image_url
                ]
            );

            const recipe = recipeResult.rows[0];

            // Insert ingredients
            if (ingredients.length > 0) {
                for (const ingredient of ingredients) {
                    await client.query(
                        `
                        INSERT INTO ingredients 
                        (recipe_id, name, quantity, unit)
                        VALUES ($1, $2, $3, $4)
                        `,
                        [
                            recipe.id,
                            ingredient.name,
                            ingredient.quantity,
                            ingredient.unit
                        ]
                    );
                }
            }

            // Insert nutritional info
            if (nutrition && Object.keys(nutrition).length > 0) {
                await client.query(
                    `
                    INSERT INTO nutritional_info 
                    (recipe_id, calories, protein, carbs, fat)
                    VALUES ($1, $2, $3, $4, $5)
                    `,
                    [
                        recipe.id,
                        nutrition.calories,
                        nutrition.protein,
                        nutrition.carbs,
                        nutrition.fat
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
            'SELECT name, quantity, unit FROM ingredients WHERE recipe_id = $1',
            [recipe.id]
        );
        recipe.ingredients = ingredientsResult.rows;

        //get nutritional info
        const nutritionResult = await db.query(
            'SELECT * FROM nutritional_info WHERE recipe_id = $1',
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

        if (filters.title) {
            paramCount++;
            query += ` AND title ILIKE $${paramCount}`;
            params.push(`%${filters.title}%`);
        }

        if(filters.cuisine_type) {
            paramCount++;
            query += ` AND cuisine_type = $${paramCount}`;
            params.push(filters.cuisine_type);
        }

        if(filters.difficulty) {
            paramCount++;
            query += ` AND difficulty = $${paramCount}`;
            params.push(filters.difficulty);
        }

        if(filters.dietary_tag) {
            paramCount++;
            query += ` AND dietary_tags @> $${paramCount}::jsonb`;
            params.push(JSON.stringify([filters.dietary_tag]));
        }

        if(filters.max_prep_time) {
            paramCount++;
            query += ` AND prep_time <= $${paramCount}`;
            params.push(filters.max_prep_time);
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
        return result.rows;
    }

//recent recipes
    static async findRecentByUserId(userId, limit = 5) {
        const result = await db.query(
            'SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
            [userId, limit]
        );
        return result.rows;
    }

//update recipe
    static async update(userId, recipeId, updates) {
        const {
            name, description, instructions, prep_time, cook_time, servings, image_url, dietary_tags, cuisine_type, difficulty
        } = updates;
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                'UPDATE recipes SET name = $1, description = $2, instructions = $3, prep_time = $4, cook_time = $5, servings = $6, image_url = $7, dietary_tags = $8, cuisine_type = $9, difficulty = $10 WHERE user_id = $11 AND id = $12 RETURNING *',
                [name =  COALESCE($1, name), description = COALESCE($2, description), instructions = COALESCE($3, instructions), prep_time = COALESCE($4, prep_time), cook_time = COALESCE($5, cook_time), servings = COALESCE($6, servings), image_url = COALESCE($7, image_url), dietary_tags = COALESCE($8, dietary_tags), cuisine_type = COALESCE($9, cuisine_type), difficulty = COALESCE($10, difficulty), userId, recipeId]
            );

            if (result.rows.length === 0) {
                throw new Error('Recipe not found');
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

    //get recipe stats
    static async getStats(userId) {
        const result = await db.query(
            `SELECT
                (SELECT COUNT(*) FROM recipes WHERE user_id = $1) AS total_recipes,
                (SELECT AVG(prep_time) FROM recipes WHERE user_id = $1) AS avg_prep_time,
                (SELECT AVG(cook_time) FROM recipes WHERE user_id = $1) AS avg_cook_time
            FROM recipes WHERE user_id = $1
        `,
            [userId]
        );
        return result.rows[0];
    }
}
export default Recipe;