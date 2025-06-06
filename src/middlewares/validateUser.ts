// external dependencies
import { Request, Response, NextFunction } from "express";

// internal dependencies
import User, { IUser } from "../models/user";

export const checkUserExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userName = req.params.developer || req.query.developer;
    if (!userName) {
      res.status(400).json({ error: "Missing GitHub username" });
      return;
    }

    const user = await User.findOne({ userName }) as IUser;
    console.log("user from db", JSON.stringify(user, null, 2));
    if (!user) {
      res.status(403).json({ error: "Unauthorized GitHub username" });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Server Error" });
  }
};
