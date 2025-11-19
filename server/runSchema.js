const fs = require("fs");
const path = require("path");
const pool = require("./config/db");

async function runSchema() {
    try {
        const schemaPath = path.join(__dirname, "../database/schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");

        console.log("Running Schema...");
        await pool.query(schema);

        console.log("✅ Schema executed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error running schema:", err);
        process.exit(1);
    }
}

runSchema();
