const express = require("express");
const router = express.Router();
const {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    getDashboardData
} = require("../controllers/expenseController");

router.post("/add", addExpense);
router.get("/all/:user_id", getExpenses);
router.put("/update/:id", updateExpense);
router.delete("/delete/:id", deleteExpense);

// Analytics for dashboard
router.get("/dashboard/:user_id", getDashboardData);

module.exports = router;
