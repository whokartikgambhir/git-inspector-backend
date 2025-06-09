// internal dependencies
import { connectMongo } from "./config.js";

export async function connect() {
    if(!process.env.NODE_ENV) {
        await connectMongo();
    } else {
        // await connectDocumentDB();
    }
}
