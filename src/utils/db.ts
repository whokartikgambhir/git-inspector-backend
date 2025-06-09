// internal dependencies
import { connectMongo } from "./config";

/**
 * Method to establish mongodb connection
 */
export async function connect() {
    if(!process.env.NODE_ENV) {
        await connectMongo();
    } else {
        // await connectDocumentDB();
    }
}
