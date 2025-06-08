// external dependencies
import { Request, Response, NextFunction } from "express";

// internal dependencies
import User from "../models/user.js";
import { APIError } from "../common/types.js";
import { MESSAGES, STATUS_CODES } from "../common/constants.js";

/**
 * Middleware to check if a developer (user) exists in the database
 *
 * @param req - express request object
 * @param res - express response object
 * @param next - next middleware function
 * @returns promise that resolves to void
 */
export const checkUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userName = req.params.developer || req.query.developer;
    if (!userName) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ error: MESSAGES.MISSING_DEVELOPER });
      return;
    }

    const user = await User.findOne({ userName });
    if (!user) {
      res.status(STATUS_CODES.NOT_FOUND).json({ error: MESSAGES.USER_NOT_FOUND });
      return;
    }

    // user exists, proceed to the next middleware/controller
    next();
  } catch (error) {
    const err = error as APIError;
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: err.message || MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
