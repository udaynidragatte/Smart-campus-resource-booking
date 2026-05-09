import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../config/db.js";
import { asyncHandler } from "../middleware/errors.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["Student", "Faculty", "Admin"])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["Student", "Faculty", "Admin"]).optional()
});

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post("/register", asyncHandler(async (req, res) => {
  const payload = registerSchema.parse(req.body);
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const result = await query(
    "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)",
    { ...payload, password: hashedPassword }
  );
  const user = { id: result.insertId, name: payload.name, email: payload.email, role: payload.role };
  res.status(201).json({ user, token: signToken(user) });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const users = await query("SELECT * FROM users WHERE email = :email", { email: payload.email });
  const user = users[0];

  if (!user || !(await bcrypt.compare(payload.password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (payload.role && payload.role !== user.role) {
    return res.status(403).json({ message: "Selected role does not match this account" });
  }

  res.json({ user: publicUser(user), token: signToken(user) });
}));

router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const users = await query("SELECT id, name, email, role FROM users WHERE id = :id", { id: req.user.id });
  res.json({ user: users[0] });
}));

export default router;
