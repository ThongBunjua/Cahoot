import { Quiz, Question } from "@/lib/realtime/types";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const STARTER_QUIZZES: Quiz[] = [
  {
    id: "0a0db060-60ca-4c7f-a2b2-18e7c5aec78f",
    title: "🚀 Web Dev & CS Master Challenge",
    description: "Battle your peers on React, JavaScript internals, Next.js App Router, and Cloud Architecture!",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    is_public: true,
    created_at: "2026-08-19T10:00:00.000Z",
    questions: [
      {
        id: "q-dev-1",
        question_text: "What does the Next.js App Router render by default for components in the app directory?",
        media_url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80",
        time_limit: 20,
        points_multiplier: 1.0,
        order_index: 0,
        correct_index: 1,
        choices: [
          { text: "Client Components", shape: "triangle", color: "red" },
          { text: "Server Components (RSC)", shape: "diamond", color: "blue" },
          { text: "Service Workers", shape: "circle", color: "yellow" },
          { text: "WebAssembly", shape: "square", color: "green" },
        ],
      },
      {
        id: "q-dev-2",
        question_text: "Which HTTP status code corresponds to '418 I\\'m a teapot'?",
        media_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
        time_limit: 20,
        points_multiplier: 1.0,
        order_index: 1,
        correct_index: 2,
        choices: [
          { text: "404 Not Found", shape: "triangle", color: "red" },
          { text: "403 Forbidden", shape: "diamond", color: "blue" },
          { text: "418 I'm a teapot", shape: "circle", color: "yellow" },
          { text: "500 Internal Error", shape: "square", color: "green" },
        ],
      },
      {
        id: "q-dev-3",
        question_text: "Why is Supabase Realtime Broadcast optimal for 150 live concurrent players?",
        media_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
        time_limit: 20,
        points_multiplier: 1.0,
        order_index: 2,
        correct_index: 0,
        choices: [
          { text: "Bypasses Postgres WAL disk writes", shape: "triangle", color: "red" },
          { text: "Saves responses in localStorage", shape: "diamond", color: "blue" },
          { text: "Requires zero JavaScript", shape: "circle", color: "yellow" },
          { text: "Converts SQL to HTML", shape: "square", color: "green" },
        ],
      },
      {
        id: "q-dev-4",
        question_text: "In JavaScript, what is the evaluation of: typeof NaN ?",
        media_url: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=80",
        time_limit: 15,
        points_multiplier: 2.0,
        order_index: 3,
        correct_index: 3,
        choices: [
          { text: "'undefined'", shape: "triangle", color: "red" },
          { text: "'NaN'", shape: "diamond", color: "blue" },
          { text: "'object'", shape: "circle", color: "yellow" },
          { text: "'number'", shape: "square", color: "green" },
        ],
      },
      {
        id: "q-dev-5",
        question_text: "Which CSS property triggers GPU hardware acceleration for smooth 60fps animations?",
        media_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
        time_limit: 20,
        points_multiplier: 1.0,
        order_index: 4,
        correct_index: 0,
        choices: [
          { text: "transform: translate3d() / will-change", shape: "triangle", color: "red" },
          { text: "float: left", shape: "diamond", color: "blue" },
          { text: "margin: auto", shape: "circle", color: "yellow" },
          { text: "font-weight: bold", shape: "square", color: "green" },
        ],
      },
    ],
  },
  {
    id: "625748e5-a426-4ba0-8b26-74e4322ed845",
    title: "🌍 World Geography & Wonders",
    description: "Explore continents, global capitals, and breathtaking natural wonders around the globe.",
    cover_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    is_public: true,
    created_at: "2026-08-19T10:00:00.000Z",
    questions: [
      {
        id: "q-geo-1",
        question_text: "What is the capital city of Australia?",
        media_url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80",
        time_limit: 20,
        points_multiplier: 1.0,
        order_index: 0,
        correct_index: 2,
        choices: [
          { text: "Sydney", shape: "triangle", color: "red" },
          { text: "Melbourne", shape: "diamond", color: "blue" },
          { text: "Canberra", shape: "circle", color: "yellow" },
          { text: "Brisbane", shape: "square", color: "green" },
        ],
      },
      {
        id: "q-geo-2",
        question_text: "Which country contains the greatest number of natural lakes on Earth?",
        media_url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80",
        time_limit: 20,
        points_multiplier: 1.0,
        order_index: 1,
        correct_index: 0,
        choices: [
          { text: "Canada (Over 2 Million)", shape: "triangle", color: "red" },
          { text: "Russia", shape: "diamond", color: "blue" },
          { text: "United States", shape: "circle", color: "yellow" },
          { text: "Finland", shape: "square", color: "green" },
        ],
      },
      {
        id: "q-geo-3",
        question_text: "Which is the smallest independent state in the world by land area?",
        media_url: "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=800&auto=format&fit=crop&q=80",
        time_limit: 15,
        points_multiplier: 1.0,
        order_index: 2,
        correct_index: 3,
        choices: [
          { text: "Monaco", shape: "triangle", color: "red" },
          { text: "San Marino", shape: "diamond", color: "blue" },
          { text: "Liechtenstein", shape: "circle", color: "yellow" },
          { text: "Vatican City", shape: "square", color: "green" },
        ],
      },
    ],
  },
  {
    id: "2bfcbe6b-07f0-4d66-95e5-f29eccce4b9e",
    title: "✨ Cosmos & Astronomy Odyssey",
    description: "Journey across the solar system, galaxies, black holes, and space missions!",
    cover_image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80",
    is_public: true,
    created_at: "2026-08-19T10:00:00.000Z",
    questions: [
      {
        id: "q-space-1",
        question_text: "Which planet has the most confirmed moons in our Solar System (146+)?",
        media_url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80",
        time_limit: 20,
        points_multiplier: 1.0,
        order_index: 0,
        correct_index: 1,
        choices: [
          { text: "Jupiter", shape: "triangle", color: "red" },
          { text: "Saturn", shape: "diamond", color: "blue" },
          { text: "Uranus", shape: "circle", color: "yellow" },
          { text: "Neptune", shape: "square", color: "green" },
        ],
      },
      {
        id: "q-space-2",
        question_text: "Approximately how long does light take to travel from the Sun to planet Earth?",
        media_url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80",
        time_limit: 20,
        points_multiplier: 1.0,
        order_index: 1,
        correct_index: 0,
        choices: [
          { text: "8 minutes and 20 seconds", shape: "triangle", color: "red" },
          { text: "1.3 seconds", shape: "diamond", color: "blue" },
          { text: "1 hour and 15 minutes", shape: "circle", color: "yellow" },
          { text: "Instantaneous", shape: "square", color: "green" },
        ],
      },
    ],
  },
];

const LOCAL_STORAGE_KEY = "cahoot_custom_quizzes";

export class QuizStore {
  // Synchronous read from localStorage or starters
  static getQuizzes(): Quiz[] {
    if (typeof window === "undefined") return STARTER_QUIZZES;

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const customQuizzes: Quiz[] = JSON.parse(stored);
        const customIds = new Set(customQuizzes.map((q) => q.id));
        const combined = [
          ...customQuizzes,
          ...STARTER_QUIZZES.filter((q) => !customIds.has(q.id)),
        ];
        return combined;
      }
    } catch (e) {
      console.warn("Error reading quizzes from localStorage:", e);
    }
    return STARTER_QUIZZES;
  }

  // Asynchronous Cloud Fetch from Supabase across all devices
  static async fetchCloudQuizzes(): Promise<Quiz[]> {
    const localQuizzes = this.getQuizzes();
    if (!isSupabaseConfigured()) return localQuizzes;

    const supabase = getSupabaseClient();
    if (!supabase) return localQuizzes;

    try {
      const { data: dbQuizzes, error } = await supabase
        .from("quizzes")
        .select("*, questions(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Error fetching cloud quizzes:", error);
        return localQuizzes;
      }

      if (dbQuizzes && dbQuizzes.length > 0) {
        const formatted: Quiz[] = dbQuizzes.map((q) => {
          const sortedQuestions: Question[] = (q.questions || [])
            .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((question: any) => ({
              id: question.id,
              question_text: question.question_text,
              media_url: question.media_url || "",
              time_limit: question.time_limit || 20,
              points_multiplier: Number(question.points_multiplier) || 1.0,
              order_index: question.order_index || 0,
              correct_index: question.correct_index ?? 0,
              choices: Array.isArray(question.choices)
                ? question.choices
                : typeof question.choices === "string"
                ? JSON.parse(question.choices)
                : [],
            }));

          return {
            id: q.id,
            title: q.title,
            description: q.description || "",
            cover_image: q.cover_image || "",
            is_public: q.is_public ?? true,
            created_at: q.created_at,
            questions: sortedQuestions.length > 0 ? sortedQuestions : STARTER_QUIZZES[0].questions,
          };
        });

        // Merge with starters and save to local storage cache
        const dbIds = new Set(formatted.map((q) => q.id));
        const merged = [
          ...formatted,
          ...STARTER_QUIZZES.filter((q) => !dbIds.has(q.id)),
        ];

        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formatted));
        } catch (e) {}

        return merged;
      }
    } catch (err) {
      console.warn("Cloud quiz sync error:", err);
    }

    return localQuizzes;
  }

  static getQuizById(id: string): Quiz | null {
    const all = this.getQuizzes();
    return all.find((q) => q.id === id) || null;
  }

  // Save Quiz to both LocalStorage and Supabase Cloud Database
  static async saveQuizAsync(quiz: Quiz): Promise<Quiz> {
    // Ensure quiz has a valid UUID
    const cleanQuizId = isUUID(quiz.id) ? quiz.id : generateUUID();
    const cleanQuestions = quiz.questions.map((q, idx) => ({
      ...q,
      id: isUUID(q.id) ? q.id : generateUUID(),
      order_index: idx,
    }));

    const sanitizedQuiz: Quiz = {
      ...quiz,
      id: cleanQuizId,
      questions: cleanQuestions,
      created_at: quiz.created_at || new Date().toISOString(),
    };

    // 1. Save to local storage
    if (typeof window !== "undefined") {
      const quizzes = this.getQuizzes();
      const existingIndex = quizzes.findIndex((q) => q.id === sanitizedQuiz.id);

      let updated: Quiz[];
      if (existingIndex >= 0) {
        updated = [...quizzes];
        updated[existingIndex] = sanitizedQuiz;
      } else {
        updated = [sanitizedQuiz, ...quizzes];
      }

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Error saving quiz to localStorage:", e);
      }
    }

    // 2. Save to Supabase Cloud Database
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          // Upsert quiz
          const { error: qErr } = await supabase.from("quizzes").upsert(
            {
              id: sanitizedQuiz.id,
              title: sanitizedQuiz.title,
              description: sanitizedQuiz.description,
              cover_image: sanitizedQuiz.cover_image,
              is_public: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          if (qErr) {
            console.warn("Supabase save quiz error:", qErr);
          } else {
            // Delete existing questions for this quiz to replace cleanly
            await supabase.from("questions").delete().eq("quiz_id", sanitizedQuiz.id);

            // Batch insert updated questions
            const questionRows = sanitizedQuiz.questions.map((q, idx) => ({
              id: q.id,
              quiz_id: sanitizedQuiz.id,
              question_text: q.question_text,
              media_url: q.media_url || "",
              time_limit: q.time_limit || 20,
              choices: q.choices,
              correct_index: q.correct_index,
              points_multiplier: q.points_multiplier || 1.0,
              order_index: idx,
            }));

            await supabase.from("questions").insert(questionRows);
          }
        } catch (err) {
          console.warn("Error uploading quiz to Supabase:", err);
        }
      }
    }

    return sanitizedQuiz;
  }

  // Delete Quiz from LocalStorage and Supabase Cloud Database
  static async deleteQuizAsync(id: string): Promise<void> {
    if (typeof window !== "undefined") {
      const quizzes = this.getQuizzes().filter((q) => q.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quizzes));
      } catch (e) {
        console.error("Error deleting quiz from localStorage:", e);
      }
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from("quizzes").delete().eq("id", id);
        } catch (err) {
          console.warn("Error deleting quiz from Supabase:", err);
        }
      }
    }
  }

  // Backward compatibility synchronous wrapper
  static saveQuiz(quiz: Quiz): Quiz {
    this.saveQuizAsync(quiz).catch(console.warn);
    return quiz;
  }

  static deleteQuiz(id: string): void {
    this.deleteQuizAsync(id).catch(console.warn);
  }
}

function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
