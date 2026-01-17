import "dotenv/config";
import { vetoAssess } from "./assess.js";
import { vetoStartSegment } from "./start-segment.js";
import { vetoEndSegment } from "./end-segment.js";
import { vetoWrapDay } from "./wrap-day.js";
import { vetoQueryPatterns } from "./query-patterns.js";
import { vetoPlan } from "./plan.js";

async function testAll() {
  console.log("=== Testing Veto MVP Tools ===\n");

  try {
    // 1. Test veto_assess
    console.log("1. Testing veto_assess...");
    const assessResult = await vetoAssess({
      energy: 7,
      focus: 6,
      mood: "testing",
      sleep_hours: 7,
    });
    console.log("   ✓ State logged:", assessResult.state_log_id);
    console.log("   Recommendation:", assessResult.recommendation.suggested_work_type);
    console.log("");

    // 2. Test veto_plan
    console.log("2. Testing veto_plan...");
    const planResult = await vetoPlan({ intended_work_type: "deep" });
    console.log("   ✓ Plan generated");
    console.log("   Recommendation:", planResult.recommendation);
    console.log("   Guardrail active:", planResult.guardrail.active);
    console.log("   Refusing:", planResult.guardrail.refusing);
    console.log("");

    // 3. Test veto_start_segment
    console.log("3. Testing veto_start_segment...");
    const startResult = await vetoStartSegment({
      intended_type: "deep",
      description: "Test segment",
      state_log_id: assessResult.state_log_id,
    });
    console.log("   ✓ Segment started:", startResult.segment.id);
    console.log("");

    // Wait a moment to simulate work
    await new Promise((r) => setTimeout(r, 2000));

    // 4. Test veto_end_segment
    console.log("4. Testing veto_end_segment...");
    const endResult = await vetoEndSegment({
      focus_score: 7,
      completed: true,
    });
    console.log("   ✓ Segment ended");
    console.log("   Duration:", endResult.duration_minutes, "minutes");
    console.log("");

    // 5. Test veto_query_patterns
    console.log("5. Testing veto_query_patterns...");
    const patternsResult = await vetoQueryPatterns({
      query_type: "deep_work_outcomes",
      days_back: 14,
    });
    console.log("   ✓ Patterns queried");
    console.log("   ", patternsResult.message);
    console.log("");

    // 6. Test veto_wrap_day
    console.log("6. Testing veto_wrap_day...");
    const wrapResult = await vetoWrapDay({
      notable_events: "Test run completed",
    });
    console.log("   ✓ Day wrapped");
    console.log("   Segments today:", wrapResult.segments_today);
    console.log("");

    console.log("=== All tests passed! ===");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testAll();
