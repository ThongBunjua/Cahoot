/**
 * ==============================================================================================
 * 🤖 CAHOOT! REALISTIC HUMAN-LIKE BOT SIMULATOR (UP TO 200+ PLAYERS)
 * ==============================================================================================
 * 
 * 📖 วิธีการเรียกใช้งานบอท (HOW TO RUN BOTS):
 * 
 * 1. รันบอทตามจำนวนที่ต้องการ (ใส่ PIN และจำนวนบอท):
 *    npx tsx scratch/stress-test-150.ts <GAME_PIN> <จำนวนบอท>
 * 
 * 2. ตัวอย่างคำสั่งที่ใช้บ่อย (Common Usage Examples):
 * 
 *    👉 ทดสอบบอท 10 ตัว (Small Group Test):
 *       npx tsx scratch/stress-test-150.ts 123456 10
 * 
 *    👉 ทดสอบบอท 50 ตัว (Classroom Test):
 *       npx tsx scratch/stress-test-150.ts 123456 50
 * 
 *    👉 ทดสอบบอท 200 ตัว (Auditorium Full Stress Test):
 *       npx tsx scratch/stress-test-150.ts 123456 200
 * 
 * ==============================================================================================
 */

import dns from "node:dns";
if (dns && typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

console.log(`\n⚡ Initializing Cahoot Realistic Bot Simulator...`);

import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const url = "https://bzazyptrrccblejktyhc.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6YXp5cHRycmNjYmxlamt0eWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3MjksImV4cCI6MjEwMjcyOTcyOX0.f-M8XNuWEZPPJdKdk-xIc_e9HbRSty6SdjhnMeg8fyo";

// Parse Game PIN from command line arguments (Arg 1: PIN, Arg 2: Count)
const targetPin = process.argv[2] || "999999";
const botCount = parseInt(process.argv[3] || "50", 10);

const AVATARS = ["🦊", "🐼", "🦁", "🐯", "🐨", "🐸", "🐙", "🦄", "🚀", "⚡", "🔥", "💎", "⭐", "🎉", "🐱", "🐶", "🐻", "🦖", "🦉", "🐺"];

const NAMES_POOL = [
  "Somchai", "Somsak", "Ananda", "Nadech", "Yaya", "Bella", "Mario", "Baifern",
  "Alex", "Max", "Leo", "Emma", "Liam", "Sophia", "Lucas", "Mia",
  "Ninja", "Pixel", "Cyber", "Rocket", "Shadow", "Flash", "Blaze", "Nova",
  "Tiger", "Arthit", "Mali", "Sun", "Sky", "Ocean", "Ken", "Ploy",
  "Ton", "Beam", "Golf", "Mike", "Nut", "Oat", "Baitong", "Pim",
  "Korn", "Natt", "James", "Mark", "Tor", "Bright", "Win", "Gulf",
  "Captain", "Zenith", "Phoenix", "Titan", "Viper", "Echo", "Cosmo", "Neon"
];

async function runRealisticPlayerSimulation() {
  console.log(`\n======================================================`);
  console.log(`🤖 CAHOOT! REALISTIC HUMAN-LIKE BOT SIMULATOR`);
  console.log(`📌 Target Game PIN: ${targetPin}`);
  console.log(`👥 Total Simulated Players: ${botCount}`);
  console.log(`======================================================`);
  console.log(`⏳ [1/2] Connecting to Realtime Channel for PIN: ${targetPin}...`);

  if (!process.argv[2]) {
    console.log(`⚠️ ไม่ได้ระบุ Game PIN! ใช้ PIN เริ่มต้น: 999999`);
    console.log(`💡 วิธีระบุ PIN: npx tsx scratch/stress-test-150.ts <PIN> <จำนวนบอท>\n`);
  }

  // Create Supabase client with WebSocket transport
  const supabase = createClient(url, key, {
    realtime: {
      transport: WebSocket as any,
      params: { eventsPerSecond: 100 },
    },
  });

  const channel = supabase.channel(`game_room_${targetPin}`, {
    config: { broadcast: { self: false, ack: false } },
  });

  // Track active bots
  const bots: Array<{ id: string; nickname: string; avatar: string; skillLevel: number }> = [];

  for (let i = 1; i <= botCount; i++) {
    const nameIndex = (i - 1) % NAMES_POOL.length;
    const roundNumber = Math.floor((i - 1) / NAMES_POOL.length);
    const suffix = roundNumber > 0 ? `${roundNumber + 1}` : "";
    const randomName = `${NAMES_POOL[nameIndex]}${suffix}`;
    const randomAvatar = AVATARS[(i - 1) % AVATARS.length];
    
    // Skill level from 0.4 (casual guesser) to 0.95 (genius student)
    const skillLevel = 0.45 + Math.random() * 0.5;

    bots.push({
      id: `player_${i}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nickname: randomName,
      avatar: randomAvatar,
      skillLevel,
    });
  }

  // Listen for Host Game Events
  channel
    .on("broadcast", { event: "game_event" }, (payload: any) => {
      const data = payload.payload;
      if (!data) return;

      if (data.event === "GET_READY") {
        console.log(`\n🔔 Host broadcasted GET_READY for Question #${(data.data?.questionIndex || 0) + 1}!`);
      }

      if (data.event === "QUESTION_START") {
        const qIndex = data.data?.questionIndex ?? 0;
        const timeLimitSec = data.data?.timeLimit || 20;
        console.log(`\n⚡ Question #${qIndex + 1} STARTED! Simulating realistic human answers (1.2s - ${Math.min(timeLimitSec - 2, 14)}s)...`);

        let submittedCount = 0;

        bots.forEach((bot, index) => {
          // Human-like response time distribution:
          // 25% Speed demons (1.2s - 2.8s)
          // 50% Average thinkers (2.8s - 6.5s)
          // 25% Careful/hesitant thinkers (6.5s - 12s)
          let delayMs = 0;
          const roll = Math.random();
          if (roll < 0.25) {
            delayMs = 1200 + Math.random() * 1600;
          } else if (roll < 0.75) {
            delayMs = 2800 + Math.random() * 3700;
          } else {
            delayMs = 6500 + Math.random() * Math.min(6000, (timeLimitSec - 8) * 1000);
          }

          // Pick an answer (0, 1, 2, 3)
          const randomChoice = Math.floor(Math.random() * 4);

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

            submittedCount++;
            if (submittedCount % 20 === 0 || submittedCount === botCount) {
              const percent = Math.round((submittedCount / botCount) * 100);
              console.log(`  ✓ Answers received: ${submittedCount}/${botCount} (${percent}%)`);
            }
          }, delayMs);
        });
      }

      if (data.event === "QUESTION_END") {
        console.log(`\n🏆 Host broadcasted QUESTION_END! Total results returned:`, data.data?.playerResults?.length || 0);
      }

      if (data.event === "SHOW_LEADERBOARD") {
        console.log(`\n📊 Host showing Leaderboard! Top 5:`, data.data?.topPlayers?.slice(0, 5).map((p: any) => `${p.nickname}: ${p.score}pts`));
      }

      if (data.event === "GAME_OVER") {
        console.log(`\n🎉 GAME OVER! Winner:`, data.data?.top3?.[0] || "Champion");
      }
    })
    .subscribe(async (status) => {
      console.log(`📡 WebSocket Channel Status: ${status}`);

      if (status === "SUBSCRIBED") {
        console.log(`\n👥 [2/2] Simulating REALISTIC human join flow (${botCount} players) into Room ${targetPin}...`);
        console.log(`💡 Players will join in natural staggered waves (like a real room/classroom)...\n`);

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

          console.log(`  ✨ [${i + 1}/${botCount}] ${bot.avatar}  ${bot.nickname} joined!`);

          // Human-like staggered joining delay:
          // Occasional quick pairs (100ms - 200ms) or natural intervals (250ms - 550ms)
          const isBurst = Math.random() < 0.35;
          const joinDelay = isBurst ? 90 + Math.random() * 120 : 250 + Math.random() * 320;
          await new Promise((r) => setTimeout(r, joinDelay));
        }

        console.log(`\n✅ ALL ${botCount} PLAYERS HAVE JOINED THE LOBBY!`);
        console.log(`👉 Check Host screen. The player count is now ${botCount}.`);
        console.log(`👉 Press "Start Game" on Host whenever you want to begin!\n`);
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        console.error(`❌ Connection error: ${status}`);
      }
    });
}

runRealisticPlayerSimulation();
