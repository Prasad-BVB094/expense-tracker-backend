const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "../../.env")
});

const { Pool } = require("pg");

// Render PostgreSQL ALWAYS needs SSL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
