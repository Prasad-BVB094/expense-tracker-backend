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

/*
   CORS CONFIG (FIXED FOR NETLIFY + RENDER)
   - Allows localhost during development
   - Allows your Netlify domain
   - Allows Netlify preview URLs
   - Uses NODE_ENV for flexible behavior
*/

const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5501",
    "http://127.0.0.1:5501",
    "https://expense-trackercc.netlify.app",   // <-- your frontend domain
    process.env.CORS_ORIGIN
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl)
            if (!origin) return callback(null, true);

            // Allow local dev OR explicitly whitelisted domains
            if (
                allowedOrigins.includes(origin) ||
                origin.endsWith("netlify.app") ||   // Allow Netlify deploy-previews
                process.env.NODE_ENV === "development"
            ) {
                return callback(null, true);
            }

            console.log("❌ BLOCKED BY CORS:", origin);
            return callback(new Error("Not allowed by CORS: " + origin));
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

// DB Test Route
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now,
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

// Default Route
app.get("/", (req, res) => {
    res.send("Expense Tracker Backend Running...");
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
