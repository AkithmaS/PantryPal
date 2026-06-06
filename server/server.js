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

async function ensureShoppingCategoryColumn() {
    await db.query(
        `ALTER TABLE shopping_list_items
         ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'Other'`
    );
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
    res.send('PantryPal');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/shopping', shoppingListRoutes);
app.use('/api/meal-plan', mealPlanRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
});

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

async function bootstrap() {
    try {
        await ensureShoppingCategoryColumn();
        startServer(basePort);
    } catch (error) {
        console.error('Failed to prepare database schema:', error);
        process.exit(1);
    }
}

bootstrap();