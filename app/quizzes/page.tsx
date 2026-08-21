"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Quiz } from "@/lib/realtime/types";
import { QuizStore } from "@/lib/store/quizStore";
import { generateGamePin } from "@/lib/utils/pinGenerator";
import { Play, Plus, Edit3, Trash2, Copy, Layers, RefreshCw, Cloud, Share2, Check } from "lucide-react";
import Link from "next/link";
import { HostGuard } from "@/components/auth/HostGuard";

function QuizzesContent() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load from local storage immediately, then fetch from Supabase Cloud
  const loadQuizzes = async () => {
    setIsLoading(true);
    // 1. Instant local render
    setQuizzes(QuizStore.getQuizzes());

    // 2. Fetch fresh cloud quizzes across all devices
    const cloudQuizzes = await QuizStore.fetchCloudQuizzes();
    setQuizzes(cloudQuizzes);
    setIsLoading(false);
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleHostGame = (quizId: string) => {
    const pin = generateGamePin();
    router.push(`/host/game/${pin}?quizId=${quizId}`);
  };

  const handleShareQuiz = (quizId: string) => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/creator/${quizId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedId(quizId);
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  const handleDuplicate = async (quiz: Quiz) => {
    const duplicated: Quiz = {
      ...quiz,
      title: `${quiz.title} (Copy)`,
      created_at: new Date().toISOString(),
    };
    await QuizStore.saveQuizAsync(duplicated);
    loadQuizzes();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      await QuizStore.deleteQuizAsync(id);
      loadQuizzes();
    }
  };

  return (
    <div className="min-h-screen bg-[#141026] text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#1b1730] border-b border-white/10 p-4 sm:px-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-white tracking-tight">
              Cahoot<span className="text-yellow-400">!</span>
            </span>
          </Link>
          <span className="text-xs font-bold bg-purple-600/30 border border-purple-500/40 text-purple-300 px-2.5 py-0.5 rounded-full uppercase">
            Host Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadQuizzes}
            disabled={isLoading}
            className="p-2 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl border border-white/10 transition-all cursor-pointer"
            title="Sync Cloud Quizzes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-yellow-400" : ""}`} />
          </button>

          <Link
            href="/creator"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </Link>
          <Link
            href="/"
            className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold rounded-xl border border-white/15 transition-all"
          >
            Player Screen
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Quiz Library & Game Launcher
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <Cloud className="w-3 h-3" />
                <span>Cloud Synced</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Choose a quiz to launch a live game session with up to 150 concurrent players.
            </p>
          </div>

          <Link
            href="/creator"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Quiz</span>
          </Link>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="group bg-[#1c1833] border border-white/10 hover:border-purple-500/50 rounded-3xl overflow-hidden shadow-xl transition-all hover:scale-[1.01] flex flex-col justify-between"
            >
              {/* Cover Image & Info */}
              <div>
                <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={quiz.cover_image || quiz.questions?.find((q) => Boolean(q.media_url))?.media_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"}
                    alt={quiz.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c1833] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{quiz.questions.length} Questions</span>
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-black text-white tracking-tight mb-1.5 line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-4">
                    {quiz.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => handleHostGame(quiz.id)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Host Live Game</span>
                </button>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <Link
                    href={`/creator/${quiz.id}`}
                    className="flex-1 py-1.5 px-3 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleShareQuiz(quiz.id)}
                    className="py-1.5 px-2.5 bg-white/10 hover:bg-yellow-400/20 text-slate-300 hover:text-yellow-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-white/10 cursor-pointer"
                    title="Copy Quiz Link to Share"
                  >
                    {copiedId === quiz.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[11px]">Share</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(quiz)}
                    className="p-1.5 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white rounded-lg transition-all border border-white/10 cursor-pointer"
                    title="Duplicate Quiz"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(quiz.id)}
                    className="p-1.5 bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-all border border-white/10 cursor-pointer"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

export default function QuizzesPage() {
  return (
    <HostGuard>
      <QuizzesContent />
    </HostGuard>
  );
}
