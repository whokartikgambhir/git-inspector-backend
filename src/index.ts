// external dependencies
import "dotenv/config";
import "reflect-metadata";
import express from "express";

// internal dependencies
import { bootstrap } from "./bootstrap.js";

const app = express();

bootstrap(app);

export default app;
