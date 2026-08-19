import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const url = "https://bzazyptrrccblejktyhc.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6YXp5cHRycmNjYmxlamt0eWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3MjksImV4cCI6MjEwMjcyOTcyOX0.f-M8XNuWEZPPJdKdk-xIc_e9HbRSty6SdjhnMeg8fyo";

const supabase = createClient(url, key, {
  realtime: {
    transport: WebSocket as any,
  },
});

async function runDiagnosis() {
  const { data: quizzes } = await supabase.from("quizzes").select("id, title").limit(3);
  console.log("Quizzes count:", quizzes?.length);
}

runDiagnosis();
