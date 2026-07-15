const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./models/db');

// Import routes
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');
// Task 1: Import the searchRoutes and store in a constant called searchRoutes
const searchRoutes = require('./routes/searchRoutes');

const app = express();
const PORT = 3060;

// Enable CORS and JSON parsing middleware
app.use(cors());
app.use(express.json());

// Serve static files (like uploaded images)
app.use(express.static('public'));

// Connect routers to paths
app.use('/api/secondchance/items', secondChanceItemsRoutes);
// Task 2: Add the searchRoutes to the server using the app.use() method
app.use('/api/secondchance/search', searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong on the server!');
});

// Connect to Database and Start Server
async function startServer() {
    try {
        await connectToDatabase();
        console.log("Connected successfully to MongoDB.");
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database", error);
        process.exit(1);
    }
}

startServer();
