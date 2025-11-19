const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existing = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, hashed]
        );

        res.json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({
            error: "Registration failed",
            details: err.message
        });
    }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = result.rows[0];

        // Password check
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        res.status(500).json({
            error: "Login failed",
            details: err.message
        });
    }
};

// UPDATE USER PROFILE
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        // Check if email is already used by another user
        const existing = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND id != $2",
            [email, id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Update user profile
        const result = await pool.query(
            "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email",
            [name, email, id]
        );

        res.json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({
            error: "Profile update failed",
            details: err.message
        });
    }
};

// GET USER PROFILE
exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT id, name, email, created_at FROM users WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: result.rows[0] });

    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch profile",
            details: err.message
        });
    }
};
