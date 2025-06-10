// external dependencies
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import express, { Application, Request, Response } from "express";

// internal dependencies
import logger from "./utils/logger";
import { connect } from "./utils/db";
import { config } from "./utils/config";
import prRoutes from "./routes/prRoutes";
import devRoutes from "./routes/devRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { apiRateLimiter } from "./utils/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import {
  API_ENDPOINTS,
  DB_STATES,
  MESSAGES,
  STATUS_CODES,
} from "./common/constants";
import { APIError } from "./common/types";

/**
 * Initializes global middlewares
 */
function initMiddlewares(app: Application): void {
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(API_ENDPOINTS.API, apiRateLimiter);
}

/**
 * Registers all API routes
 */
function initRoutes(app: Application): void {
  app.use(API_ENDPOINTS.API, authRoutes);
  app.use(API_ENDPOINTS.API, userRoutes);
  app.use(API_ENDPOINTS.API, prRoutes);
  app.use(API_ENDPOINTS.API, devRoutes);
}

/**
 * Health check route for DB status and uptime
 */
function initHealthCheck(app: Application): void {
  app.get(API_ENDPOINTS.HEALTH_CHECK, async (_: Request, res: Response) => {
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
}

/**
 * Initializes and starts the app
 */
export async function bootstrap(app: Application): Promise<void> {
  initMiddlewares(app);
  initRoutes(app);
  initHealthCheck(app);
  app.use(errorHandler);

  try {
    await connect();
    logger.info("MongoDB connected");
    app.listen(config.port, () =>
      logger.info(`Server running on port ${config.port}`)
    );
  } catch (err) {
    logger.error(`${err}, MongoDB connection error`);
    process.exit(1);
  }
}
