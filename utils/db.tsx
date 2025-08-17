import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'
const sql = neon(process.env.NEXT_PUBLIC_DRIZZLE_DB_URL!);
export const db = drizzle(sql,{schema});




// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";
// import { config } from "dotenv";
// config({ path: ".env.local" }); // or .env.local
// const sql = neon(process.env.NEXT_PUBLIC_DRIZZLE_DB_URL!);
// export const db = drizzle({ client: sql });