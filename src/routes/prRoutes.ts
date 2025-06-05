// external dependencies
import express from "express";

// internal dependencies
import { getOpenPRsController } from "../controllers/prController";

const router = express.Router();

router.get("/prs/open", getOpenPRsController);

export default router;
