import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || !/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    console.error('DATABASE_URL must be a valid PostgreSQL connection string, for example postgres://user:password@host:5432/database');
    process.exit(1);
}

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
});

async function runMigrations() {
    const client = await pool.connect();

    try {
        console.log('Running migrations...');

        const schemaPath = path.join(process.cwd(), 'config', 'schema.sql');
        const schemaSql = await fs.readFile(schemaPath, 'utf-8');

        await client.query(schemaSql);
        await client.query(`ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'Other'`);

        console.log('Migrations completed successfully.');
        console.log('tables created');
        console.log('  - users');
        console.log('  - ingredients');
        console.log('  - recipes');
        console.log('  - meal_plans');
        console.log('  - shopping_lists');
        console.log('  - waste_logs');
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations();