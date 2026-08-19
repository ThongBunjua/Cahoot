"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Quiz } from "@/lib/realtime/types";
import { QuizStore } from "@/lib/store/quizStore";
import { generateGamePin } from "@/lib/utils/pinGenerator";
import { Play, Plus, Edit3, Trash2, Copy, Sparkles, BookOpen, Layers } from "lucide-react";
import Link from "next/link";

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    setQuizzes(QuizStore.getQuizzes());
  }, []);

  const handleHostGame = (quizId: string) => {
    const pin = generateGamePin();
    router.push(`/host/game/${pin}?quizId=${quizId}`);
  };

  const handleDuplicate = (quiz: Quiz) => {
    const duplicated: Quiz = {
      ...quiz,
      id: `quiz_${Date.now()}`,
      title: `${quiz.title} (Copy)`,
      created_at: new Date().toISOString(),
    };
    QuizStore.saveQuiz(duplicated);
    setQuizzes(QuizStore.getQuizzes());
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      QuizStore.deleteQuiz(id);
      setQuizzes(QuizStore.getQuizzes());
    }
  };

  return (
    <div className="min-h-screen bg-kahoot-dark text-white flex flex-col">
      {/* Top Header */}
      <header className="bg-kahoot-dark-surface/80 backdrop-blur-xl border-b border-white/10 p-6 sm:px-12 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl font-black text-white tracking-tighter">
              Cahoot<span className="text-kahoot-yellow">!</span>
            </span>
          </Link>
          <span className="text-xs font-bold bg-kahoot-purple text-white px-2.5 py-1 rounded-full uppercase">
            Library
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/creator"
            className="px-5 py-2.5 bg-kahoot-purple hover:bg-kahoot-purple-light text-white text-sm font-black rounded-xl shadow-3d-purple transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-white/10 transition-all"
          >
            Join as Player
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              Quiz Library & Game Launcher
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Choose a quiz to host a live game session with up to 150 concurrent players.
            </p>
          </div>

          <Link
            href="/creator"
            className="px-6 py-3.5 bg-kahoot-green hover:bg-kahoot-green-dark text-white font-black rounded-2xl shadow-3d-green transition-all flex items-center gap-2 text-base"
          >
            <Plus className="w-5 h-5" />
            <span>New Quiz</span>
          </Link>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="group bg-kahoot-dark-card border border-white/10 hover:border-white/25 rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-[1.01] flex flex-col justify-between"
            >
              {/* Cover Image & Info */}
              <div>
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={quiz.cover_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"}
                    alt={quiz.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-kahoot-dark-card via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{quiz.questions.length} Questions</span>
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black text-white tracking-tight mb-2 line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-4">
                    {quiz.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleHostGame(quiz.id)}
                  className="w-full py-3.5 px-4 bg-kahoot-green hover:bg-kahoot-green-dark text-white font-black text-base rounded-2xl shadow-3d-green transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Host Live Game</span>
                </button>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <Link
                    href={`/creator/${quiz.id}`}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(quiz)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-white/10"
                    title="Duplicate Quiz"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 bg-slate-800 hover:bg-red-950/50 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-white/10"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
