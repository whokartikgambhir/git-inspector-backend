// external dependencies
import winston from 'winston';

// Create a Winston logger instance with JSON formatting and timestamps
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log to console
    new winston.transports.Console({
      stderrLevels: ['error'],
      consoleWarnLevels: ['warn'],
    }),
  ],
});

export default logger;
