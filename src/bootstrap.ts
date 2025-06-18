// external dependencies
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import express, { Application, Request, Response } from "express";

// internal dependencies
import logger from "./utils/logger.js";
import { connect } from "./utils/db.js";
import { config } from "./utils/config.js";
import prRoutes from "./routes/prRoutes.js";
import devRoutes from "./routes/devRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { apiRateLimiter } from "./utils/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import {
  API_ENDPOINTS,
  DB_STATES,
  MESSAGES,
  STATUS_CODES,
} from "./common/constants.js";
import { APIError } from "./common/types.js";

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
  // Serve Swagger API Docs
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Register API routes
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
        timestamp: new Date().toISOString()
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
