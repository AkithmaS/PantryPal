import db from '../config/db.js';

const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const normalizeName = (name) => String(name || '').trim().toLowerCase();

const ensureWasteLogTable = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS waste_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            item_name VARCHAR(255) NOT NULL,
            normalized_name VARCHAR(255) NOT NULL,
            quantity INTEGER NOT NULL,
            unit VARCHAR(50) NOT NULL,
            reason VARCHAR(50) NOT NULL DEFAULT 'expired',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

class PantryItem {
    static async create(userId, itemData) {
        const {
            name,
            quantity,
            unit,
            category,
            expiration_date,
            is_running_low
        } = itemData;

        const result = await db.query(
            `INSERT INTO pantry_items (user_id, name, quantity, unit, category, expiration_date, is_running_low)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                userId,
                name,
                quantity,
                unit,
                category,
                expiration_date,
                is_running_low
            ]
        );

        return result.rows[0];
    }

    //get all pantry items for a user
    static async getAllByUserId(userId, filters = {}) {
        let query = 'SELECT * FROM pantry_items WHERE user_id = $1';
        const params = [userId];
        let paramIndex = 2;

        if (filters.category) {
            query += ` AND category = $${paramIndex}`;
            params.push(filters.category);
            paramIndex++;
        }

        if (filters.is_running_low !== undefined) {
            query += ` AND is_running_low = $${paramIndex}`;
            params.push(filters.is_running_low);
            paramIndex++;
        }

        if (filters.search) {
            query += ` AND name ILIKE $${paramIndex}`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        query += ' ORDER BY created_at DESC';

        const results = await db.query(query, params);
        return results.rows;
    }

    //get items expiring soon(within 7 days)
    static async getExpiringSoon(userId, days = 7) {
        const result = await db.query(
            `SELECT * FROM pantry_items
             WHERE user_id = $1
               AND expiration_date <= CURRENT_DATE + ($2 || ' days')::interval
               AND expiration_date >= CURRENT_DATE
             ORDER BY expiration_date ASC`,
            [userId, days]
        );
        return result.rows;
    }

    static async getExpired(userId) {
        const result = await db.query(
            `SELECT id, name, expiration_date AS "expiryDate", quantity, unit
             FROM pantry_items
             WHERE user_id = $1
               AND expiration_date < CURRENT_DATE
             ORDER BY expiration_date ASC`,
            [userId]
        );

        return result.rows;
    }

    static async logWaste(client, userId, item) {
        await client.query(
            `INSERT INTO waste_logs (user_id, item_name, normalized_name, quantity, unit, reason)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, item.name, normalizeName(item.name), item.quantity, item.unit, 'expired']
        );
    }

    static async deleteExpired(userId) {
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');
            await ensureWasteLogTable(client);

            const expiredItemsResult = await client.query(
                `SELECT id, name, quantity, unit, expiration_date
                 FROM pantry_items
                 WHERE user_id = $1
                   AND expiration_date < CURRENT_DATE
                 ORDER BY expiration_date ASC
                 FOR UPDATE`,
                [userId]
            );

            const expiredItems = expiredItemsResult.rows;

            if (expiredItems.length === 0) {
                await client.query('COMMIT');
                return { count: 0, items: [] };
            }

            for (const item of expiredItems) {
                await PantryItem.logWaste(client, userId, item);
            }

            const deleteResult = await client.query(
                `DELETE FROM pantry_items
                 WHERE user_id = $1
                   AND expiration_date < CURRENT_DATE
                 RETURNING id`,
                [userId]
            );

            await client.query('COMMIT');

            return {
                count: deleteResult.rowCount,
                items: expiredItems.map((item) => item.id)
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    //get pantry items by ID
    static async getById(userId, itemId) {
        const result = await db.query(
            'SELECT * FROM pantry_items WHERE user_id = $1 AND id = $2',
            [userId, itemId]
        );
        return result.rows[0];
    }

    //update pantry item
    static async update(userId, itemId, itemData) {
        const {
            name,
            quantity,
            unit,
            category,
            expiration_date,
            is_running_low
        } = itemData;
        const result = await db.query(
            `UPDATE pantry_items
             SET name = $1,
                 quantity = $2,
                 unit = $3,
                 category = $4,
                 expiration_date = $5,
                 is_running_low = $6
             WHERE user_id = $7 AND id = $8
             RETURNING *`,
            [
                name,
                quantity,
                unit,
                category,
                expiration_date,
                is_running_low,
                userId,
                itemId
            ]
        );
        return result.rows[0];
    }

    //delete pantry item
    static async delete(userId, itemId) {
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');
            await ensureWasteLogTable(client);

            const itemResult = await client.query(
                `SELECT *, expiration_date < CURRENT_DATE AS is_expired
                 FROM pantry_items
                 WHERE user_id = $1 AND id = $2
                 FOR UPDATE`,
                [userId, itemId]
            );

            const item = itemResult.rows[0];

            if (!item) {
                await client.query('ROLLBACK');
                return null;
            }

            if (item.is_expired) {
                await PantryItem.logWaste(client, userId, item);
            }

            const deleteResult = await client.query(
                'DELETE FROM pantry_items WHERE user_id = $1 AND id = $2 RETURNING *',
                [userId, itemId]
            );

            await client.query('COMMIT');
            return deleteResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    //get pantry statistics
    static async getStatistics(userId) {
        const result = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM pantry_items WHERE user_id = $1) AS total_items,
                (SELECT COUNT(*) FROM pantry_items WHERE user_id = $1 AND is_running_low = true) AS low_stock_items,
                (SELECT COUNT(*) FROM pantry_items WHERE user_id = $1 AND expiration_date <= CURRENT_DATE) AS expired_items,
                (SELECT COUNT(*) FROM pantry_items WHERE user_id = $1 AND expiration_date > CURRENT_DATE AND expiration_date <= CURRENT_DATE + INTERVAL '7 days') AS expiring_soon_items`,
            [userId]
        );
        return result.rows[0];
    }
}

    export default PantryItem;