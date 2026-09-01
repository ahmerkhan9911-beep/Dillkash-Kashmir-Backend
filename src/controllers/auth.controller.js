import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { UserModel } from "../models/user.model.js";

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function signup(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, email, phone, password } = req.body;

    // Check duplicate email
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user — always role "user"
    const userId = await UserModel.create({
      full_name,
      email,
      phone,
      password_hash,
      role: "user",
    });

    const user = await UserModel.findById(userId);
    const token = generateToken(user);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to create account" });
  }
}

export async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user (includes password_hash)
    let user;
    try {
      user = await UserModel.findByEmail(email);
    } catch (dbErr) {
      console.error("Database query failed during login:", dbErr);
      if (dbErr && dbErr.code === "ER_ACCESS_DENIED_ERROR") {
        return res.status(500).json({
          error: "Database authentication failed. Please set the correct DB_PASSWORD in server/.env",
        });
      }
      if (dbErr && dbErr.code === "ER_BAD_DB_ERROR") {
        return res.status(500).json({
          error: "Database not found. Please run 'npm run init-db' in the server directory.",
        });
      }
      if (dbErr && (dbErr.code === "ECONNREFUSED" || dbErr.code === "PROTOCOL_CONNECTION_LOST")) {
        return res.status(500).json({
          error: "Cannot connect to MySQL server. Please ensure MySQL is running on port " + (process.env.DB_PORT || "3306"),
        });
      }
      return res.status(500).json({ error: "Database error: " + (dbErr.message || "Failed to query database") });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message || "Login failed" });
  }
}

export async function getMe(req, res) {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}
