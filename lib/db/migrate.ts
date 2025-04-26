import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config();
if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not defined in .env file");
}
