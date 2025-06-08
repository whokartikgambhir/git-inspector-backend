// external dependencies
import { Request, Response } from 'express';

// internal dependencies
import { MESSAGES, STATUS_CODES } from '../common/constants.js';
import { APIError } from '../common/types.js';

/**
 * Express error handling middleware
 * Logs the error and sends a standardized error response
 * In non-production environments, includes the stack trace for easier debugging
 * 
 * @param err - APIError error object
 * @param req - express request object
 * @param res - express response object
 */
export const errorHandler = (
  err: APIError,
  req: Request,
  res: Response
): void => {
  // logs error with a timestamp and stack trace if available
  console.error(`[${new Date().toISOString()}] Error:`, err.stack || err);

  const status = err.status || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || MESSAGES.INTERNAL_SERVER_ERROR;

  // build error response object
  const response: { error: string; stack?: string } = { error: message };

  // include stack trace in response if not in production
  if (process.env.NODE_ENV !== "production" && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};
