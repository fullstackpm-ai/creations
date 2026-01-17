/**
 * Test script for veto_assess
 * Run with: npm run test:assess
 */

import { vetoAssess } from "./assess.js";

async function test() {
  console.log("Testing veto_assess...\n");

  try {
    // Test 1: Basic assessment
    console.log("Test 1: Basic assessment (energy: 7, focus: 8)");
    const profile1 = await vetoAssess({
      energy: 7,
      focus: 8,
      mood: "focused",
      sleep_hours: 7.5,
    });
    console.log("Result:", JSON.stringify(profile1, null, 2));
    console.log("\n---\n");

    // Test 2: Low energy state
    console.log("Test 2: Low energy state (energy: 4, focus: 5)");
    const profile2 = await vetoAssess({
      energy: 4,
      focus: 5,
      mood: "tired",
      sleep_hours: 5,
      notes: "Late night, rough morning",
    });
    console.log("Result:", JSON.stringify(profile2, null, 2));
    console.log("\n---\n");

    console.log("All tests passed!");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

test();
