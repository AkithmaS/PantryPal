import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import pantryRoutes from './routes/pantry.js';
import recipeRoutes from './routes/recipes.js';
import shoppingListRoutes from './routes/shoppingList.js';
import mealPlanRoutes from './routes/mealPlan.js';

dotenv.config();

const app = express();

// ---------------------------------------------------------------------------
// One-time schema migration: ensure the category column exists.
// Runs on first invocation in serverless environments (cold start).
// ---------------------------------------------------------------------------
let schemaMigrated = false;

async function ensureSchema() {
    if (schemaMigrated) return;
    try {
        await db.query(
            `ALTER TABLE shopping_list_items
             ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'Other'`
        );
        schemaMigrated = true;
    } catch (err) {
        // Non-fatal — log and continue
        console.error('Schema migration warning:', err.message);
    }
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Allow requests from any origin in production (tighten this after deploy
// by replacing '*' with your actual Vercel domain).
const allowedOrigins = process.env.CLIENT_URL
    ? [process.env.CLIENT_URL]
    : ['http://localhost:5173', 'http://localhost:4173'];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (curl, Postman, same-origin)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            // In development allow everything
            if (process.env.NODE_ENV !== 'production') return callback(null, true);
            callback(new Error(`CORS: origin ${origin} not allowed`));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Run schema migration before every request (no-op after first run)
app.use(async (_req, _res, next) => {
    await ensureSchema();
    next();
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get('/', (_req, res) => res.send('PantryPal API'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/shopping', shoppingListRoutes);
app.use('/api/meal-plan', mealPlanRoutes);

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
    });
});

// ---------------------------------------------------------------------------
// Local development server
// When this file is run directly (node server.js / nodemon), start listening.
// When imported by api/index.js on Vercel, just export the app.
// ---------------------------------------------------------------------------
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('server/server.js')) {
    const basePort = Number(process.env.PORT) || 4000;
    const maxPort = basePort + 20;

    function startServer(port) {
        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE' && port < maxPort) {
                console.log(`Port ${port} is in use, trying ${port + 1}...`);
                startServer(port + 1);
                return;
            }
            console.error('Server failed to start:', error);
            process.exit(1);
        });
    }

    // Run schema migration once at startup for local dev
    ensureSchema()
        .then(() => startServer(basePort))
        .catch((err) => {
            console.error('Failed to prepare database schema:', err);
            process.exit(1);
        });
}

export default app;
