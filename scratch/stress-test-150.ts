import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const url = "https://bzazyptrrccblejktyhc.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6YXp5cHRycmNjYmxlamt0eWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3MjksImV4cCI6MjEwMjcyOTcyOX0.f-M8XNuWEZPPJdKdk-xIc_e9HbRSty6SdjhnMeg8fyo";

// Parse Game PIN from command line arguments or default
const targetPin = process.argv[2] || "999999";
const botCount = parseInt(process.argv[3] || "150", 10);

const AVATARS = ["🦊", "🐼", "🦁", "🐯", "🐨", "🐸", "🐙", "🦄", "🚀", "⚡", "🔥", "💎", "⭐", "🎉"];
const NAMES = [
  "Somchai", "Somsak", "Ananda", "Nadech", "Yaya", "Bella", "Mario", "Baifern",
  "Alex", "Max", "Leo", "Emma", "Liam", "Sophia", "Lucas", "Mia",
  "Ninja", "Pixel", "Cyber", "Rocket", "Shadow", "Flash", "Blaze", "Nova"
];

async function run150PlayerSimulation() {
  console.log(`\n======================================================`);
  console.log(`🚀 STARTING LIVE STRESS TEST SIMULATOR (150 PLAYERS)`);
  console.log(`📌 Target Game PIN: ${targetPin}`);
  console.log(`👥 Total Simulated Bots: ${botCount}`);
  console.log(`======================================================\n`);

  // Create Supabase client with WebSocket transport
  const supabase = createClient(url, key, {
    realtime: {
      transport: WebSocket as any,
      params: { eventsPerSecond: 50 },
    },
  });

  const channel = supabase.channel(`game_room_${targetPin}`, {
    config: { broadcast: { self: false, ack: false } },
  });

  // Track active bots
  const bots: Array<{ id: string; nickname: string; avatar: string }> = [];

  for (let i = 1; i <= botCount; i++) {
    const randomName = NAMES[(i - 1) % NAMES.length] + "_" + i;
    const randomAvatar = AVATARS[(i - 1) % AVATARS.length];
    bots.push({
      id: `bot_${i}_${Date.now()}`,
      nickname: randomName,
      avatar: randomAvatar,
    });
  }

  // Listen for Host Game Events
  channel
    .on("broadcast", { event: "game_event" }, (payload: any) => {
      const data = payload.payload;
      if (!data) return;

      if (data.event === "GET_READY") {
        console.log(`\n🔔 Host broadcasted GET_READY for Question #${data.data.questionIndex + 1}!`);
      }

      if (data.event === "QUESTION_START") {
        const qIndex = data.data.questionIndex;
        console.log(`\n⚡ Question #${qIndex + 1} STARTED! Simulating ${botCount} answers...`);

        // Simulate 150 bots answering with random realistic latency (0.3s - 4.5s)
        bots.forEach((bot, index) => {
          const randomChoice = Math.floor(Math.random() * 4); // 0, 1, 2, 3
          const randomDelay = 300 + Math.random() * 3800; // 300ms to 4100ms

          setTimeout(() => {
            channel.send({
              type: "broadcast",
              event: "game_event",
              payload: {
                event: "SUBMIT_ANSWER",
                pin: targetPin,
                data: {
                  playerId: bot.id,
                  nickname: bot.nickname,
                  answerIndex: randomChoice,
                  clientTimestamp: Date.now(),
                },
              },
            });

            if ((index + 1) % 30 === 0 || index + 1 === botCount) {
              console.log(`  ✓ ${index + 1}/${botCount} bots submitted answers.`);
            }
          }, randomDelay);
        });
      }

      if (data.event === "QUESTION_END") {
        console.log(`\n🏆 Host broadcasted QUESTION_END! Total results returned:`, data.data.playerResults?.length);
      }

      if (data.event === "SHOW_LEADERBOARD") {
        console.log(`\n📊 Host showing Leaderboard! Top 5:`, data.data.topPlayers?.map((p: any) => `${p.nickname}: ${p.score}pts`));
      }

      if (data.event === "GAME_OVER") {
        console.log(`\n🎉 GAME OVER! Winner:`, data.data.top3?.[0]);
      }
    })
    .subscribe(async (status) => {
      console.log(`📡 WebSocket Channel Subscription Status: ${status}`);

      if (status === "SUBSCRIBED") {
        console.log(`\n🤖 Injecting ${botCount} player bots into Game PIN: ${targetPin}...`);

        // Batch inject bots in quick succession
        for (let i = 0; i < bots.length; i++) {
          const bot = bots[i];
          channel.send({
            type: "broadcast",
            event: "game_event",
            payload: {
              event: "PLAYER_JOIN",
              pin: targetPin,
              data: {
                id: bot.id,
                nickname: bot.nickname,
                avatar: bot.avatar,
              },
            },
          });

          // Small stagger of 15ms so the host sees player names cascading in beautifully
          await new Promise((r) => setTimeout(r, 15));

          if ((i + 1) % 25 === 0 || i + 1 === botCount) {
            console.log(`  ✓ Joined ${i + 1}/${botCount} players...`);
          }
        }

        console.log(`\n✅ ALL ${botCount} BOTS HAVE SUCCESSFULLY JOINED ROOM ${targetPin}!`);
        console.log(`👉 Look at the Host screen. You should see ${botCount} players in the lobby.`);
        console.log(`👉 Press "Start Game" on Host whenever you are ready.`);
      }
    });
}

run150PlayerSimulation();
