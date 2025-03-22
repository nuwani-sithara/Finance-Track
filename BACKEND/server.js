const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors"); // Ensure cors is imported
require("dotenv").config();


const app = express();

// Allow requests from frontend (localhost:3003)
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3003", "http://localhost:3001", ], // Add your frontend origins here
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
}));

app.use(bodyParser.json()); // Parse JSON request bodies
app.use(express.json()); // Parse JSON request bodies (alternative to bodyParser.json)


// Environment Variables
const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;

// Database Connection
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
  }).then(() => {
    console.log("Connected to MongoDB");
  }).catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
// const currencyRoutes = require('./routes/currencyRoutes');

app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api', currencyRoutes);

// Default Route
app.get("/", (req, res) => {
    res.send("Welcome to the Finance Management API!");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});