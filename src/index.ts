// external dependencies
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

// internal dependencies
import {
  API_ENDPOINTS,
  DB_STATES,
  DEFAULT_PORT,
  MESSAGES,
  STATUS_CODES,
} from "./common/constants.js";
import prRoutes from "./routes/prRoutes.js";
import { APIError } from "./common/types.js";
import devRoutes from "./routes/devRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || DEFAULT_PORT;

// middleware to parse JSON bodies
app.use(express.json());

// register API route modules
app.use(API_ENDPOINTS.API, authRoutes);
app.use(API_ENDPOINTS.API, userRoutes);
app.use(API_ENDPOINTS.API, prRoutes);
app.use(API_ENDPOINTS.API, devRoutes);

// health check endpoint to monitor server and DB status
app.get(API_ENDPOINTS.HEALTH_CHECK, async (_, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    let dbStatus: string;

    // map Mongoose connection state to human-readable status
    switch (dbState) {
      case 0:
        dbStatus = DB_STATES.DISCONNECTED;
        break;
      case 1:
        dbStatus = DB_STATES.CONNECTED;
        break;
      case 2:
        dbStatus = DB_STATES.CONNECTING;
        break;
      case 3:
        dbStatus = DB_STATES.DISCONNECTING;
        break;
      default:
        dbStatus = DB_STATES.UNKNOWN;
    }

    res.status(STATUS_CODES.OK).json({
      status: MESSAGES.STATUS_OK,
      uptime: process.uptime(),
      dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const err = error as APIError;
    console.error("Health check failed:", err.message);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: MESSAGES.INTERNAL_SERVER_ERROR,
      error: err.message,
    });
  }
});

// connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI || "", {})
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
