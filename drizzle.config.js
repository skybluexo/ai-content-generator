import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

export default defineConfig({
  schema: "./utils/schema.tsx",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DRIZZLE_DBCREDENTIALS_URL,
  },
});


// import { defineConfig } from "drizzle-kit";
// export default defineConfig({
//   dialect: "postgresql",
//   schema: "./src/schema.ts",
// });