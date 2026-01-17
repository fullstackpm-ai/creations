import { supabase } from "./client.js";

async function testConnection() {
  console.log("Testing Veto <-> Supabase connection...\n");

  // Test 1: Basic connection
  console.log("1. Testing basic connection...");
  const { data, error } = await supabase.from("state_logs").select("count");

  if (error && error.code === "42P01") {
    console.log("   Connection works, but tables not yet created.");
    console.log("   Run schema.sql in Supabase SQL Editor first.\n");
    return;
  }

  if (error) {
    console.error("   Connection failed:", error.message);
    return;
  }

  console.log("   Connected successfully!\n");

  // Test 2: Check tables exist
  console.log("2. Checking tables...");
  const tables = ["state_logs", "segments", "daily_summaries", "refusal_events"];

  for (const table of tables) {
    const { error: tableError } = await supabase.from(table).select("count");
    if (tableError) {
      console.log(`   ❌ ${table}: not found`);
    } else {
      console.log(`   ✓ ${table}: exists`);
    }
  }

  console.log("\nConnection test complete.");
}

testConnection().catch(console.error);
