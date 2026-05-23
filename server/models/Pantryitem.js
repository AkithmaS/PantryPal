import { param } from 'framer-motion/client';
import db from '../config/db.js';
class PantryItem {
    static async create(userId,itemData) {
        const {name, quantity, unit, categgory, expiry_date, is_running_low} = itemData;
        const [result] = await db.query(
            'INSERT INTO pantry_items (user_id, name, quantity, unit, category, expiry_date, is_running_low) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, name, quantity, unit, categgory, expiry_date, is_running_low]
        );
        return result.rows[0];
    }
        //get all pantry items for a user
         static async getAllByUserId(userId, filters = {}) {
            let query = 'SELECT * FROM pantry_items WHERE user_id = ?';
            const params = [userId];
            let paramCount =1;

            if (filters.category) {
                paramCount++;
                query += ` AND category = ?`;
                params.push(filters.category);
            }

            if (filters.is_running_low !== undefined) {
                paramCount++;
                query += ` AND is_running_low = ?`;
                params.push(filters.is_running_low);
            }

            if(filters.search) {
                paramCount++;
                query += ` AND name LIKE ?`;
                params.push(`%${filters.search}%`);
            }

            query += ' ORDER BY created_at DESC ';

            const results = await db.query(query, params);
            return results.rows;
        }

        //get items expiring soon(within 7 days)
        static async getExpiringSoon(userId, days = 7) {
            const [result] = await db.query(
                `SELECT * FROM pantry_items WHERE user_id = ? AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY) AND expiry_date >= CURDATE() ORDER BY expiry_date ASC`,
                [userId, days]
            );
            return result.rows;
        }

        //get pantry items by ID
        static async getById(userId, itemId) {
            const [result] = await db.query(
                'SELECT * FROM pantry_items WHERE user_id = ? AND id = ?',
                [userId, itemId]
            );
            return result.rows[0];
        }

        //update pantry item
        static async update(userId, itemId, itemData) {
            const {name, quantity, unit, category, expiry_date, is_running_low} = itemData;
            const [result] = await db.query(
                'UPDATE pantry_items SET name = ?, quantity = ?, unit = ?, category = ?, expiry_date = ?, is_running_low = ? WHERE user_id = ? AND id = ? RETURNING *',
                [name, quantity, unit, category, expiry_date, is_running_low, userId, itemId]
            );
            return result.rows[0];
        }

        //delete pantry item
        static async delete(userId, itemId) {
            const [result] = await db.query(
                'DELETE FROM pantry_items WHERE user_id = ? AND id = ? RETURNING *',
                [userId, itemId]
            );
            return result.rows[0];
        }

        //get pantry statistics
        static async getStatistics(userId) {
            const [result] = await db.query(
                `SELECT 
                    (SELECT COUNT(*) FROM pantry_items WHERE user_id = ?) AS total_items,
                    (SELECT COUNT(*) FROM pantry_items WHERE user_id = ? AND is_running_low = true) AS low_stock_items,
                    (SELECT COUNT(*) FROM pantry_items WHERE user_id = ? AND expiry_date <= CURDATE()) AS expired_items,
                    (SELECT COUNT(*) FROM pantry_items WHERE user_id = ? AND expiry_date > CURDATE() AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)) AS expiring_soon_items`,
                [userId, userId, userId, userId]
            );
            return result.rows[0];
        }
    }

    export default PantryItem;