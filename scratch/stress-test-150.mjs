#!/usr/bin/env node

/**
 * ==============================================================================================
 * 🤖 CAHOOT! LIVE MULTIPLAYER BOT SIMULATOR & STRESS TESTER (NATIVE NODE ENGINE)
 * ==============================================================================================
 * 
 * 📖 วิธีรันง่ายและเร็วที่สุด (Instant Startup):
 *    node scratch/stress-test-150.mjs <GAME_PIN> <จำนวนบอท>
 *    หรือ: npm run bot <GAME_PIN> <จำนวนบอท>
 * 
 * 💡 ตัวอย่าง:
 *    node scratch/stress-test-150.mjs 8183 150
 *    npm run bot 8183 150
 * 
 * ==============================================================================================
 */

// Instant stdout feedback
console.log(`\n⚡ Initializing Cahoot Bot Simulator...`);

import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const url = "https://bzazyptrrccblejktyhc.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6YXp5cHRycmNjYmxlamt0eWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3MjksImV4cCI6MjEwMjcyOTcyOX0.f-M8XNuWEZPPJdKdk-xIc_e9HbRSty6SdjhnMeg8fyo";

// Parse Game PIN from command line arguments (Arg 1: PIN, Arg 2: Count)
const targetPin = process.argv[2] || "999999";
const botCount = parseInt(process.argv[3] || "150", 10);

const AVATARS = ["🦊", "🐼", "🦁", "🐯", "🐨", "🐸", "🐙", "🦄", "🚀", "⚡", "🔥", "💎", "⭐", "🎉"];
const NAMES = [
  "Somchai", "Somsak", "Ananda", "Nadech", "Yaya", "Bella", "Mario", "Baifern",
  "Alex", "Max", "Leo", "Emma", "Liam", "Sophia", "Lucas", "Mia",
  "Ninja", "Pixel", "Cyber", "Rocket", "Shadow", "Flash", "Blaze", "Nova",
  "Thong", "Arthit", "Mali", "Sun", "Sky", "Ocean", "Ken", "Ploy"
];

async function runPlayerSimulation() {
  console.log(`======================================================`);
  console.log(`🚀 CAHOOT! BOT SIMULATOR`);
  console.log(`📌 Target Game PIN: ${targetPin}`);
  console.log(`👥 Total Simulated Bots: ${botCount}`);
  console.log(`======================================================`);
  console.log(`⏳ [1/2] Connecting to Supabase WebSocket for PIN ${targetPin}...`);

  if (!process.argv[2]) {
    console.log(`⚠️ ไม่ได้ระบุ Game PIN! ใช้ PIN เริ่มต้น: 999999`);
    console.log(`💡 วิธีระบุ PIN: node scratch/stress-test-150.mjs <PIN> <จำนวนบอท>\n`);
  }

  // Create Supabase client with WebSocket transport
  const supabase = createClient(url, key, {
    realtime: {
      transport: WebSocket,
      params: { eventsPerSecond: 100 },
    },
  });

  const channel = supabase.channel(`game_room_${targetPin}`, {
    config: { broadcast: { self: false, ack: false } },
  });

  // Track active bots
  const bots = [];

  for (let i = 1; i <= botCount; i++) {
    const nameIndex = (i - 1) % NAMES.length;
    const suffix = Math.floor((i - 1) / NAMES.length) > 0 ? `_${Math.floor((i - 1) / NAMES.length) + 1}` : "";
    const randomName = `${NAMES[nameIndex]}${suffix}`;
    const randomAvatar = AVATARS[(i - 1) % AVATARS.length];
    bots.push({
      id: `bot_${i}_${Date.now()}`,
      nickname: randomName,
      avatar: randomAvatar,
    });
  }

  // Listen for Host Game Events
  channel
    .on("broadcast", { event: "game_event" }, (payload) => {
      const data = payload?.payload;
      if (!data) return;

      if (data.event === "GET_READY") {
        console.log(`\n🔔 Host broadcasted GET_READY for Question #${(data.data?.questionIndex || 0) + 1}!`);
      }

      if (data.event === "QUESTION_START") {
        const qIndex = data.data?.questionIndex ?? 0;
        console.log(`\n⚡ Question #${qIndex + 1} STARTED! Simulating ${botCount} answers...`);

        // Simulate bots answering with random realistic latency (0.3s - 4.5s)
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

            if ((index + 1) % 25 === 0 || index + 1 === botCount) {
              console.log(`  ✓ ${index + 1}/${botCount} bots submitted answers.`);
            }
          }, randomDelay);
        });
      }

      if (data.event === "QUESTION_END") {
        console.log(`\n🏆 Host broadcasted QUESTION_END! Total results returned:`, data.data?.playerResults?.length || 0);
      }

      if (data.event === "SHOW_LEADERBOARD") {
        console.log(`\n📊 Host showing Leaderboard! Top 5:`, data.data?.topPlayers?.slice(0, 5).map((p) => `${p.nickname}: ${p.score}pts`));
      }

      if (data.event === "GAME_OVER") {
        console.log(`\n🎉 GAME OVER! Winner:`, data.data?.top3?.[0] || "Champion");
      }
    })
    .subscribe(async (status) => {
      console.log(`📡 WebSocket Channel Status: ${status}`);

      if (status === "SUBSCRIBED") {
        console.log(`\n🤖 [2/2] Injecting ${botCount} player bots into Game PIN: ${targetPin}...`);

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

          // Fast stagger of 8ms
          await new Promise((r) => setTimeout(r, 8));

          if ((i + 1) % 25 === 0 || i + 1 === botCount) {
            console.log(`  ✓ Joined ${i + 1}/${botCount} players...`);
          }
        }

        console.log(`\n✅ ALL ${botCount} BOTS HAVE SUCCESSFULLY JOINED ROOM ${targetPin}!`);
        console.log(`👉 Look at the Host screen. You should see ${botCount} players in the lobby.`);
        console.log(`👉 Keep this terminal open and press "Start Game" on Host whenever you are ready.\n`);
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        console.error(`❌ Connection error: ${status}`);
      }
    });
}

runPlayerSimulation();
