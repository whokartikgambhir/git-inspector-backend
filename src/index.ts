// external dependencies
import cors from "cors";
import "reflect-metadata";
import helmet from "helmet";
import express from "express";
import mongoose from "mongoose";

// internal dependencies
import "dotenv/config";
import "./utils/config";
import {
  API_ENDPOINTS,
  DB_STATES,
  MESSAGES,
  STATUS_CODES,
} from "./common/constants.js";
import { config } from "./utils/config.js";
import logger from "./utils/logger.js";
import prRoutes from "./routes/prRoutes.js";
import devRoutes from "./routes/devRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { apiRateLimiter } from "./utils/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { APIError } from "./common/types.js";
import { connect } from "./utils/db.js";

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({ origin: config.corsOrigin }));

// Parse JSON bodies
app.use(express.json());

// Rate limiting middleware for all /api routes
app.use(API_ENDPOINTS.API, apiRateLimiter);

// Register API routes
app.use(API_ENDPOINTS.API, authRoutes);
app.use(API_ENDPOINTS.API, userRoutes);
app.use(API_ENDPOINTS.API, prRoutes);
app.use(API_ENDPOINTS.API, devRoutes);

// Health check endpoint
app.get(API_ENDPOINTS.HEALTH_CHECK, async (_, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    let dbStatus: string;

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
    logger.error(
      `${err}, route: ${API_ENDPOINTS.HEALTH_CHECK}, Health check failed`
    );
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: MESSAGES.INTERNAL_SERVER_ERROR,
      error: err.message,
    });
  }
});

// Global error handler
app.use(errorHandler);

// Connect to MongoDB and start the server
mongoose;
await connect()
  .then(() => {
    logger.info("MongoDB connected");
    app.listen(config.port, () =>
      logger.info(`Server running on port ${config.port}`)
    );
  })
  .catch((err) => {
    logger.error(`${err}, MongoDB connection error`);
    process.exit(1);
  });
