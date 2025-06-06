// external dependencies
import express from "express";
import type { Request, Response } from "express";

// internal dependencies
import User from "../models/user";

const router = express.Router();

// Create a new user
router.post("/users", async (req: Request, res: Response) => {
  try {
    const { userName, email } = req.body;
    console.log("username", userName);
    console.log("email", email);
    if (!userName)
      return res.status(400).json({ error: "username is required" });

    const existing = await User.findOne({ userName });
    console.log("existing user", existing);
    if (existing) return res.status(409).json({ error: "user already exists" });

    const user = await User.create({ userName, email });
    res.status(201).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch users data
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a user
router.delete("/users", async (req: Request, res: Response) => {
  try {
    const { userName } = req.body;

    const query: any = {};
    if (userName) query.userName = userName;

    const result = await User.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `User ${userName} not found` });
    } else {
      return res.status(200).json({ message: `User ${userName} deleted successfully` });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
