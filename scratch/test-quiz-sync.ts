import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const url = "https://bzazyptrrccblejktyhc.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6YXp5cHRycmNjYmxlamt0eWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3MjksImV4cCI6MjEwMjcyOTcyOX0.f-M8XNuWEZPPJdKdk-xIc_e9HbRSty6SdjhnMeg8fyo";

const supabase = createClient(url, key, {
  realtime: {
    transport: WebSocket as any,
  },
});

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function testQuizSync() {
  console.log("=== 1. Testing Quiz Creation in Supabase ===");
  const testQuizId = generateUUID();
  const testQ1Id = generateUUID();

  const { data: qData, error: qErr } = await supabase.from("quizzes").insert({
    id: testQuizId,
    title: "🎮 Live Cloud Quiz Test",
    description: "Testing cross-device quiz sharing across all devices",
    cover_image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    is_public: true,
  }).select().single();

  if (qErr) {
    console.error("❌ Quiz insert error:", qErr);
    return;
  }
  console.log("✓ Successfully created quiz in Supabase:", qData.title, qData.id);

  console.log("\n=== 2. Testing Questions Insert ===");
  const { data: questionsData, error: questionsErr } = await supabase.from("questions").insert([
    {
      id: testQ1Id,
      quiz_id: testQuizId,
      question_text: "Does this quiz appear across all devices?",
      time_limit: 20,
      correct_index: 0,
      points_multiplier: 1.0,
      order_index: 0,
      choices: [
        { text: "Yes, 100% cloud synced!", shape: "triangle", color: "red" },
        { text: "No", shape: "diamond", color: "blue" },
        { text: "Maybe", shape: "circle", color: "yellow" },
        { text: "Never", shape: "square", color: "green" },
      ],
    },
  ]).select();

  if (questionsErr) {
    console.error("❌ Questions insert error:", questionsErr);
    return;
  }
  console.log("✓ Successfully created questions in Supabase:", questionsData.length);

  console.log("\n=== 3. Testing Fetching All Quizzes with Nested Questions ===");
  const { data: allQuizzes, error: fetchErr } = await supabase
    .from("quizzes")
    .select("*, questions(*)")
    .order("created_at", { ascending: false });

  if (fetchErr) {
    console.error("❌ Fetch error:", fetchErr);
  } else {
    console.log(`✓ Successfully fetched ${allQuizzes?.length} quizzes from cloud:`);
    allQuizzes?.forEach((q) => {
      console.log(`  - [${q.title}] with ${q.questions?.length} questions (ID: ${q.id})`);
    });
  }

  // Cleanup test quiz
  await supabase.from("quizzes").delete().eq("id", testQuizId);
  console.log("\n✓ Cleaned up test quiz successfully.");
}

testQuizSync();
