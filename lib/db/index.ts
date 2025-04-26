import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// importing schema from the schema file
import * as schema from "./schema";

// Initialize the database connection using the Neon database URL from environment variables
// and create a drizzle instance for ORM operations.
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export the database instance for use in other parts of the application
export { sql };
