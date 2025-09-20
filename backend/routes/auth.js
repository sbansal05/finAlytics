const { Router } = require("express");
const { userModel } = require("../models/user");
const jwt = require("jsonwebtoken");
const { JWT_PASSWORD } = require("../config");
const bcrypt = require("bcrypt");
const { z } = require("zod");

const authRouter = Router();

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().regex(emailRegex, "Invalid email"),
  password: z.string().min(6),
  avatar: z.string().optional(),
  preferences: z.any().optional(),
});

const signinSchema = z.object({
  email: z.string().regex(emailRegex, "Invalid email"),
  password: z.string().min(1),
});

authRouter.post("/signup", async (req, res) => {
  const validation = signupSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }
  const { name, email, password, avatar, preferences } = validation.data;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: "User with this email already exists" 
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, password: hashedPassword, avatar, preferences });

    const token = jwt.sign({ id: user._id }, JWT_PASSWORD, { expiresIn: "1h" });
    res.json({ message: "Signup succeeded", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.post("/signin", async (req, res) => {
  const validation = signinSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }
  const { email, password } = validation.data;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(403).json({ message: "Incorrect credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(403).json({ message: "Incorrect credentials" });

    const token = jwt.sign({ id: user._id }, JWT_PASSWORD, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { authRouter };
