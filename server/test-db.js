// server/test-db.js
const pool = require("./config/db");
(async () => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    console.log("DB connected:", r.rows[0]);
    process.exit(0);
  } catch (e) {
    console.error("DB error:", e.message);
    process.exit(1);
  }
})();
