// internal dependencies
import { connectMongo } from "./config";
import logger from "./logger";

/**
 * Method to establish mongodb connection
 */
export async function connect() {
    logger.info("NODE_ENV => ", process.env.NODE_ENV);
    if(!process.env.NODE_ENV) {
        await connectMongo();
    } else {
        // await connectDocumentDB();
    }
}
