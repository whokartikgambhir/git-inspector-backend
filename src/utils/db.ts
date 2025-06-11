// internal dependencies
import { connectMongo } from "./config";

/**
 * Method to establish mongodb connection
 */
export async function connect() {
  await connectMongo();
}
