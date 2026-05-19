import db from '../config/db.js';

class UserPreferences {
    //create new user preferences
    static async upsert (userId, preferences) {
        const {
            dietary_restrictions = [],
            allergies = [],
            preffered_cuisines = [],
            default_serving_size = 4,
            measurement_units = 'metric'
        } = preferences;

        const result = await db.query(  
            `INSERT INTO user_preferences (user_id, dietary_restrictions, allergies, preffered_cuisines, default_serving_size, measurement_units)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id) DO UPDATE SET    
                dietary_restrictions = EXCLUDED.dietary_restrictions,
                allergies = EXCLUDED.allergies,
                preffered_cuisines = EXCLUDED.preffered_cuisines,
                default_serving_size = EXCLUDED.default_serving_size,
                measurement_units = EXCLUDED.measurement_units
             RETURNING *`,
            [userId, dietary_restrictions, allergies, preffered_cuisines, default_serving_size, measurement_units]
        );
        return result.rows[0]; 
    }

    //get user preferences by user id
    static async findByUserId(userId) {
        const result = await db.query(
            'SELECT * FROM user_preferences WHERE user_id = $1',
            [userId]
        );
        return result.rows[0];
    }

    //delete user preferences
    static async deleteByUserId(userId) {
        await db.query(
            'DELETE FROM user_preferences WHERE user_id = $1',
            [userId]
        );
    }
        }

        export default UserPreferences;