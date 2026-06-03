import db from '../config/db.js';

class MealPlan {
    // add recipe to meal plan
    static async addRecipe(userId, mealData) {
        const { recipe_id, meal_date, meal_type } = mealData;
        const date = meal_date;

        const result = await db.query(
            `INSERT INTO meal_plans (user_id, recipe_id, meal_date, meal_type) VALUES ($1, $2, $3, $4) 
            ON CONFLICT (user_id, meal_date, meal_type) DO UPDATE SET recipe_id = EXCLUDED.recipe_id
            RETURNING *`,
            [userId, recipe_id, date, meal_type]
        );
        return result.rows[0];
    }

    static async findDateRange(userId, startDate, endDate) {
        const result = await db.query(
            `SELECT mp.*, r.name AS title, r.image_url FROM meal_plans mp 
            JOIN recipes r ON mp.recipe_id = r.id 
            WHERE mp.user_id = $1 AND mp.meal_date BETWEEN $2 AND $3
            ORDER BY mp.meal_date ASC, 
            CASE mp.meal_type
                WHEN 'breakfast' THEN 1
                WHEN 'lunch' THEN 2
                WHEN 'dinner' THEN 3
                end`,
            [userId, startDate, endDate]
        );
        return (result.rows || []).map(row => {
            if (row.image_url && typeof row.image_url === 'string' && row.image_url.startsWith('data:image/') && row.image_url.length > 900000) {
                return { ...row, image_url: null };
            }
            return row;
        });
    }
     //get weekly meal plan for a user
    static async getWeeklyPlan(userId, weekStart) {
        const endDate = new Date(weekStart);
        endDate.setDate(endDate.getDate() + 6);
        
        return await this.findDateRange(userId, weekStart, endDate);
    }

    //get upcoming meal plan for a user(next 7 days )
    static async getUpcomingPlan(userId, limit =5) {
        const result = await db.query(
            `SELECT mp.*, r.name AS title, r.image_url FROM meal_plans mp 
            JOIN recipes r ON mp.recipe_id = r.id
            WHERE mp.user_id = $1 AND mp.meal_date >= CURRENT_DATE
            ORDER BY mp.meal_date ASC, 
            CASE mp.meal_type
                WHEN 'breakfast' THEN 1
                WHEN 'lunch' THEN 2
                WHEN 'dinner' THEN 3
                end
            LIMIT $2`,
            [userId, limit]
        );
        return (result.rows || []).map(row => {
            if (row.image_url && typeof row.image_url === 'string' && row.image_url.startsWith('data:image/') && row.image_url.length > 900000) {
                return { ...row, image_url: null };
            }
            return row;
        });
    }

    //delete meal plan entry
    static async delete(userId, mealPlanId) {
        const result = await db.query(
            'DELETE FROM meal_plans WHERE user_id = $1 AND id = $2 RETURNING *',
            [userId, mealPlanId]
        );
        return result.rows[0];
}

//get meal plan stats
static async getStats(userId) {
    const result = await db.query(
        `SELECT
            COUNT(*) AS total_meals,
            COUNT(*) FILTER (where meal_date >= CURRENT_DATE AND meal_date < CURRENT_DATE + INTERVAL '7 days') AS upcoming_meals,
            COUNT(DISTINCT meal_date) AS unique_meal_days
        FROM meal_plans WHERE user_id = $1`,
        [userId]
    );
    return result.rows[0];
}
}
export default MealPlan;

