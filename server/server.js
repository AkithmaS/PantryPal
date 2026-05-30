import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import pantryRoutes from './routes/pantry.js';
import recipeRoutes from './routes/recipes.js';
import shoppingListRoutes from './routes/shoppingList.js';
import mealPlanRoutes from './routes/mealPlan.js';  

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('PantryPal');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/meal-plan', mealPlanRoutes);


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

startServer(basePort);