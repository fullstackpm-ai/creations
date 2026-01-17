import { supabase } from "./client.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  console.log("Running Veto database migration...\n");

  const schemaPath = join(__dirname, "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");

  // Split by semicolon and filter empty statements
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    const preview = statement.substring(0, 60).replace(/\n/g, " ");
    console.log(`Executing: ${preview}...`);

    const { error } = await supabase.rpc("exec_sql", { sql: statement + ";" });

    if (error) {
      // Try direct query for DDL statements
      const { error: directError } = await supabase.from("_").select().limit(0);

      // If it's a table creation, we need to use the SQL editor or migrations
      console.log(`  Note: DDL statements should be run in Supabase SQL Editor`);
      console.log(`  Statement: ${preview}...\n`);
    } else {
      console.log("  Done\n");
    }
  }

  console.log("Migration complete.");
  console.log("\nNote: Run the schema.sql file directly in Supabase SQL Editor");
  console.log("Dashboard → SQL Editor → New Query → Paste schema.sql → Run");
}

migrate().catch(console.error);
