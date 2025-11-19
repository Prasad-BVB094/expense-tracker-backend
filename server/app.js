const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const pool = require("./config/db");

dotenv.config({ path: path.join(__dirname, "../.env") });

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5500",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

// DB Test Route
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Routes
app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);

// Global Error Handler
app.use(errorHandler);

app.get("/", (req, res) => {
    res.send("Expense Tracker Backend Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
