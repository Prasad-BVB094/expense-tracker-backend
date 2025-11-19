const pool = require("../config/db");

// Add Expense
exports.addExpense = async (req, res) => {
    try {
        const { user_id, amount, category, date, note } = req.body;

        const result = await pool.query(
            `INSERT INTO expenses (user_id, amount, category, date, note)
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, user_id, amount, category, date, note`,
            [user_id, amount, category, date, note]
        );

        res.json({ message: "Expense added", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Failed to add expense", details: err.message });
    }
};


// Get All Expenses for user
exports.getExpenses = async (req, res) => {
    try {
        const user_id = req.params.user_id;

        const result = await pool.query(
            `SELECT * FROM expenses WHERE user_id=$1 ORDER BY date DESC`,
            [user_id]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
};


// Update Expense
exports.updateExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const { amount, category, date, note } = req.body;

        await pool.query(
            `UPDATE expenses
             SET amount=$1, category=$2, date=$3, note=$4 
             WHERE id=$5`,
            [amount, category, date, note, id]
        );

        res.json({ message: "Expense updated" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update expense" });
    }
};


// Delete Expense
exports.deleteExpense = async (req, res) => {
    try {
        const id = req.params.id;

        await pool.query(`DELETE FROM expenses WHERE id=$1`, [id]);

        res.json({ message: "Expense deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete expense" });
    }
};


// Dashboard Analytics Data
exports.getDashboardData = async (req, res) => {
    try {
        const user_id = req.params.user_id;

        // Today's total
        const today = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total
             FROM expenses
             WHERE user_id = $1
               AND date = CURRENT_DATE`,
            [user_id]
        );

        // This month total
        const month = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total
             FROM expenses
             WHERE user_id = $1
               AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)`,
            [user_id]
        );

        // Top Category
        const category = await pool.query(
            `SELECT category, SUM(amount)::numeric AS total
             FROM expenses
             WHERE user_id=$1
             GROUP BY category
             ORDER BY total DESC
             LIMIT 1`,
            [user_id]
        );

        // Category Breakdown (Pie Chart)
        const categoryBreakdown = await pool.query(
            `SELECT category, SUM(amount)::numeric AS total
             FROM expenses
             WHERE user_id=$1
             GROUP BY category
             ORDER BY SUM(amount)::numeric DESC`,
            [user_id]
        );

        // Monthly Trend (last 6 months)
        const trend = await pool.query(
            `SELECT 
                TO_CHAR(date, 'Mon') AS month,
                DATE_TRUNC('month', date) AS month_date,
                SUM(amount)::numeric AS total
             FROM expenses
             WHERE user_id = $1
               AND date >= CURRENT_DATE - INTERVAL '6 months'
             GROUP BY month, month_date
             ORDER BY month_date`,
            [user_id]
        );
        // Last 7 Days (including today, properly ordered)
        const weekly = await pool.query(
            `WITH last_7_days AS (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '6 days',
                    CURRENT_DATE,
                    '1 day'::interval
                )::date AS date
            )
            SELECT 
                TO_CHAR(l.date, 'Dy') AS day,
                COALESCE(SUM(e.amount), 0)::numeric AS total,
                l.date
            FROM last_7_days l
            LEFT JOIN expenses e ON e.date = l.date AND e.user_id = $1
            GROUP BY l.date
            ORDER BY l.date`,
            [user_id]
        );
        const categoryBar = await pool.query(
        `SELECT category, SUM(amount)::numeric AS total
        FROM expenses
        WHERE user_id=$1
        GROUP BY category
        ORDER BY category ASC`,
        [user_id]
    );

        // Total Expenses Count
        const expenseCount = await pool.query(
            `SELECT COUNT(*) as count FROM expenses WHERE user_id = $1`,
            [user_id]
        );

        // Average Daily Spending (last 30 days)
        const avgDaily = await pool.query(
            `SELECT COALESCE(AVG(daily_total), 0)::numeric AS average
             FROM (
                 SELECT date, SUM(amount) as daily_total
                 FROM expenses
                 WHERE user_id = $1
                   AND date >= CURRENT_DATE - INTERVAL '30 days'
                 GROUP BY date
             ) AS daily_totals`,
            [user_id]
        );

        // This Year Total
        const yearTotal = await pool.query(
            `SELECT COALESCE(SUM(amount), 0)::numeric AS total
             FROM expenses
             WHERE user_id = $1
               AND DATE_TRUNC('year', date) = DATE_TRUNC('year', CURRENT_DATE)`,
            [user_id]
        );

        // Top 5 Expenses
        const topExpenses = await pool.query(
            `SELECT amount, category, date, note
             FROM expenses
             WHERE user_id = $1
             ORDER BY amount DESC
             LIMIT 5`,
            [user_id]
        );

        // Month over Month comparison
        const monthComparison = await pool.query(
            `SELECT 
                TO_CHAR(date, 'Mon YYYY') AS month,
                SUM(amount)::numeric AS total
             FROM expenses
             WHERE user_id = $1
               AND date >= CURRENT_DATE - INTERVAL '12 months'
             GROUP BY TO_CHAR(date, 'Mon YYYY'), DATE_TRUNC('month', date)
             ORDER BY DATE_TRUNC('month', date) DESC
             LIMIT 2`,
            [user_id]
        );

        // Category Growth Rate (current vs previous month)
        const categoryGrowth = await pool.query(
            `WITH current_month AS (
                SELECT category, SUM(amount)::numeric AS total
                FROM expenses
                WHERE user_id = $1
                  AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
                GROUP BY category
            ),
            previous_month AS (
                SELECT category, SUM(amount)::numeric AS total
                FROM expenses
                WHERE user_id = $1
                  AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                GROUP BY category
            )
            SELECT 
                COALESCE(c.category, p.category) AS category,
                COALESCE(c.total, 0) AS current,
                COALESCE(p.total, 0) AS previous,
                CASE 
                    WHEN COALESCE(p.total, 0) = 0 THEN 100
                    ELSE ROUND(((COALESCE(c.total, 0) - COALESCE(p.total, 0)) / p.total * 100)::numeric, 2)
                END AS growth_rate
            FROM current_month c
            FULL OUTER JOIN previous_month p ON c.category = p.category
            ORDER BY growth_rate DESC`,
            [user_id]
        );

        // Daily Average by Day of Week
        const weekdayPattern = await pool.query(
            `SELECT 
                TO_CHAR(date, 'Day') AS day_name,
                EXTRACT(DOW FROM date) AS day_num,
                AVG(amount)::numeric AS avg_amount,
                COUNT(*) AS frequency
             FROM expenses
             WHERE user_id = $1
               AND date >= CURRENT_DATE - INTERVAL '90 days'
             GROUP BY day_name, day_num
             ORDER BY day_num`,
            [user_id]
        );

        // Spending Velocity (expenses per day trend)
        const spendingVelocity = await pool.query(
            `SELECT 
                DATE_TRUNC('week', date) AS week,
                COUNT(*)::numeric / 7 AS expenses_per_day,
                SUM(amount)::numeric / 7 AS amount_per_day
             FROM expenses
             WHERE user_id = $1
               AND date >= CURRENT_DATE - INTERVAL '8 weeks'
             GROUP BY week
             ORDER BY week DESC
             LIMIT 8`,
            [user_id]
        );

        // Budget Recommendation (based on historical average)
        const budgetRecommendation = await pool.query(
            `SELECT 
                AVG(monthly_total)::numeric * 1.1 AS recommended_budget,
                MAX(monthly_total)::numeric AS highest_month,
                MIN(monthly_total)::numeric AS lowest_month,
                STDDEV(monthly_total)::numeric AS volatility
             FROM (
                 SELECT DATE_TRUNC('month', date) AS month, SUM(amount) AS monthly_total
                 FROM expenses
                 WHERE user_id = $1
                   AND date >= CURRENT_DATE - INTERVAL '6 months'
                 GROUP BY month
             ) AS monthly_totals`,
            [user_id]
        );



        res.json({
            today: today.rows[0].total,
            month: month.rows[0].total,
            topCategory: category.rows[0]?.category || "None",
            categories: categoryBreakdown.rows,
            trend: trend.rows,
            weekly: weekly.rows,
            categoryBar: categoryBar.rows,
            expenseCount: expenseCount.rows[0].count,
            avgDaily: avgDaily.rows[0].average,
            yearTotal: yearTotal.rows[0].total,
            topExpenses: topExpenses.rows,
            monthComparison: monthComparison.rows,
            categoryGrowth: categoryGrowth.rows,
            weekdayPattern: weekdayPattern.rows,
            spendingVelocity: spendingVelocity.rows,
            budgetRecommendation: budgetRecommendation.rows[0] || {}
        });

    } catch (err) {
        res.status(500).json({
            error: "Failed to load dashboard data",
            details: err.message
        });
    }
};
