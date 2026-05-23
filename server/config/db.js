import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;

const {
    DATABASE_URL,
    PGHOST,
    PGUSER,
    PGPASSWORD,
    PGDATABASE,
    PGPORT,
    PGSSL
} = process.env;

const hasUrl = Boolean(DATABASE_URL);
const hasParams = Boolean(PGHOST || PGUSER || PGPASSWORD || PGDATABASE || PGPORT);

if (!hasUrl && !hasParams) {
    throw new Error(
        'Database config missing. Set DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT in server/.env.'
    );
}

const isLocal = (value) => typeof value === 'string' && /localhost|127\.0\.0\.1/i.test(value);
const connectionString = DATABASE_URL || null;

if (connectionString) {
    try {
        new URL(connectionString);
    } catch (error) {
        throw new Error(
            'DATABASE_URL is invalid. Expected format: postgresql://user:password@host:5432/database'
        );
    }
}
const shouldUseSsl = PGSSL === 'true' || (connectionString && !isLocal(connectionString));

const pool = new Pool({
    ...(connectionString
        ? { connectionString }
        : {
              host: PGHOST || 'localhost',
              user: PGUSER || 'postgres',
              password: PGPASSWORD || '',
              database: PGDATABASE || 'pantrypal',
              port: PGPORT ? Number(PGPORT) : 5432
          }),
    ...(shouldUseSsl ? { ssl: { rejectUnauthorized: false } } : {})
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default{
    query: (text, params) => pool.query(text, params),
    pool
};