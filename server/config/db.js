const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "../../.env")
});

const { Pool, types } = require("pg");

// Prevent PostgreSQL DATE (OID 1082) from auto-converting to JS Date
// Keeps dates exactly as stored: '2025-11-19'
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // Local: no SSL
    // Render: SSL required → rejectUnauthorized:false
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,

    // Set default timezone (helps dashboard & charts)
    options: "-c timezone=Asia/Kolkata"
});

// Enforce timezone + date style on every DB connection
pool.on("connect", async (client) => {
    await client.query("SET timezone = 'Asia/Kolkata'");
    await client.query("SET datestyle = 'ISO, DMY'");
});

module.exports = pool;