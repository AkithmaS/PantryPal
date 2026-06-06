import db from '../config/db.js';

async function migrate() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token       VARCHAR(255) NOT NULL UNIQUE,
            expires_at  TIMESTAMP NOT NULL,
            used        BOOLEAN DEFAULT FALSE,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_prt_token   ON password_reset_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);
    `);

    console.log('Migration complete: password_reset_tokens table ready.');
    process.exit(0);
}

migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
