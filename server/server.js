const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get('/', (req, res) => {
    res.send('PantryPal');
});

const basePort = Number(process.env.PORT) || 4000;
const maxPort = basePort + 20;

function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Environment: ${process.env.MODE_ENV || 'development'}`);
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