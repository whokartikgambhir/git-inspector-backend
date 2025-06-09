// external dependencies
import express, { Router, Request, Response } from "express";

// internal dependencies
import User, { IUser } from "../models/user";
import { APIError } from "../common/types";
import { CreateUserDto } from "../common/dtos/user.dto";
import { validateRequest } from "../middlewares/validateRequest";
import { API_ENDPOINTS, STATUS_CODES, MESSAGES } from "../common/constants";

const router: Router = express.Router();

// POST /users - Create a new user
// this route creates a new user in the database if the userName does not already exist
router.post(
  API_ENDPOINTS.USER,
  validateRequest(CreateUserDto),
  async (req: Request, res: Response) => {
    try {
      const { userName, email } = req.body;
      
      const existing = await User.findOne({ userName }) as IUser;
      if (existing) {
        res.status(STATUS_CODES.CONFLICT).json({ error: MESSAGES.USER_EXISTS });
        return;
      }

      const user = (await User.create({ userName, email })) as IUser;
      res
        .status(STATUS_CODES.CREATED)
        .json({ message: MESSAGES.USER_CREATED, user });
    } catch (error) {
      const err = error as APIError;
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }
);

// GET /users - Fetch all users
// this route retrieves all users from the database
router.get(API_ENDPOINTS.USER, async (req: Request, res: Response) => {
  try {
    const users = (await User.find()) as IUser[];
    if (users.length === 0) {
      res.status(STATUS_CODES.NOT_FOUND).json({ error: MESSAGES.USER_NOT_FOUND });
      return;
    }
    res.status(STATUS_CODES.OK).json(users);
  } catch (error) {
    const err = error as APIError;
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

// DELETE /users?userName="" - Delete a user by userName (query param)
// this route deletes a user if the userName query parameter is provided and exists in the database
router.delete(API_ENDPOINTS.USER, async (req: Request, res: Response) => {
  try {
    const { userName } = req.query;
    if (!userName || typeof userName !== "string") {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: "userName query parameter is required" });
      return;
    }

    const result = await User.deleteOne({ userName });
    if (result.deletedCount === 0) {
      res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: `${MESSAGES.USER_NOT_FOUND}: ${userName}` });
      return;
    } else {
      res
        .status(STATUS_CODES.OK)
        .json({ message: `${MESSAGES.USER_DELETED}: ${userName}` });
      return;
    }
  } catch (error) {
    const err = error as APIError;
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

export default router;
