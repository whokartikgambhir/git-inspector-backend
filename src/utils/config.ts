// external dependencies
import Joi from "joi";
import mongoose from "mongoose";

// internal dependencies
import logger from "./logger.js";

// schema for expected environment variables
const envSchema = Joi.object({
  MONGO_URI: Joi.string().uri().required().messages({
    "any.required": "MONGO_URI is required",
    "string.uri": "MONGO_URI must be a valid URI",
  }),

  ENCRYPTION_KEY: Joi.string().hex().length(64).required().messages({
    "any.required": "ENCRYPTION_KEY is required",
    "string.length": "ENCRYPTION_KEY must be a 64-character hex string",
  }),

  PORT: Joi.number().port().default(3000),

  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "debug", "trace")
    .default("info"),

  GITHUB_BASE_URL: Joi.string().uri().default("https://api.github.com"),

  CORS_ORIGIN: Joi.string()
    .default("*")
    .messages({ "string.base": "CORS_ORIGIN must be a string" }),
}).unknown(true); // allow other env vars

// Validate process.env against schema
const { value: envVars, error } = envSchema.validate(process.env, {
  abortEarly: false, // report all missing/invalid fields
});

if (error) {
  throw new Error(
    `Environment validation error: ${error.details
      .map((d) => d.message)
      .join(", ")}`
  );
}

// Export a structured config object
export const config = {
  mongoUri: envVars.MONGO_URI as string,
  encryptionKey: envVars.ENCRYPTION_KEY as string,
  port: envVars.PORT as number,
  logLevel: envVars.LOG_LEVEL as string,
  githubBaseUrl: envVars.GITHUB_BASE_URL as string,
  corsOrigin: envVars.CORS_ORIGIN as string,
};

let _isConnected = false;

/**
 * Method to connect mongodb, it checks for MONGO_URL env var
 *
 * @returns the connection status
 */
export async function connectMongo() {
  logger.info("Connecting mongodb");
  if (_isConnected) {
    logger.info("Already connected!");
    return true;
  }
  try {
    const url = config.mongoUri as string;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    _isConnected = true;
    logger.info("connection successful");
    return true;
  } catch (err) {
    logger.error("Something failed", err);
    return false;
  }
}

export default mongoose;
