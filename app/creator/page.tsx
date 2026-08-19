"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Quiz, Question } from "@/lib/realtime/types";
import { QuizStore } from "@/lib/store/quizStore";
import { CreatorHeader } from "@/components/creator/CreatorHeader";
import { SlideSidebar } from "@/components/creator/SlideSidebar";
import { QuestionStage } from "@/components/creator/QuestionStage";
import { generateGamePin } from "@/lib/utils/pinGenerator";
import { HostGuard } from "@/components/auth/HostGuard";

const DEFAULT_QUESTION: Omit<Question, "id" | "order_index"> = {
  question_text: "",
  media_url: "",
  time_limit: 20,
  points_multiplier: 1.0,
  correct_index: 0,
  choices: [
    { text: "", shape: "triangle", color: "red" },
    { text: "", shape: "diamond", color: "blue" },
    { text: "", shape: "circle", color: "yellow" },
    { text: "", shape: "square", color: "green" },
  ],
};

function CreatorStudioContent() {
  const router = useRouter();
  const [title, setTitle] = useState("My New Quiz");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q_${Date.now()}_1`,
      order_index: 0,
      question_text: "What does the Next.js App Router render by default for components?",
      media_url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80",
      time_limit: 20,
      points_multiplier: 1.0,
      correct_index: 1,
      choices: [
        { text: "Client Components", shape: "triangle", color: "red" },
        { text: "Server Components", shape: "diamond", color: "blue" },
        { text: "Web Workers", shape: "circle", color: "yellow" },
        { text: "Static HTML Export", shape: "square", color: "green" },
      ],
    },
  ]);

  const activeQuestion = questions[activeQuestionIndex] || questions[0];

  const handleAddQuestion = () => {
    const newQ: Question = {
      ...DEFAULT_QUESTION,
      id: `q_${Date.now()}_${questions.length + 1}`,
      order_index: questions.length,
      choices: [
        { text: "", shape: "triangle", color: "red" },
        { text: "", shape: "diamond", color: "blue" },
        { text: "", shape: "circle", color: "yellow" },
        { text: "", shape: "square", color: "green" },
      ],
    };
    const updated = [...questions, newQ];
    setQuestions(updated);
    setActiveQuestionIndex(updated.length - 1);
  };

  const handleDuplicateQuestion = () => {
    const target = questions[activeQuestionIndex];
    const duplicated: Question = {
      ...target,
      id: `q_${Date.now()}_dup`,
      order_index: activeQuestionIndex + 1,
      choices: target.choices.map((c) => ({ ...c })),
    };
    const updated = [
      ...questions.slice(0, activeQuestionIndex + 1),
      duplicated,
      ...questions.slice(activeQuestionIndex + 1),
    ];
    setQuestions(updated);
    setActiveQuestionIndex(activeQuestionIndex + 1);
  };

  const handleDeleteQuestion = () => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, idx) => idx !== activeQuestionIndex);
    setQuestions(updated);
    setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1));
  };

  const handleUpdateActiveQuestion = (updated: Question) => {
    const newQuestions = [...questions];
    newQuestions[activeQuestionIndex] = updated;
    setQuestions(newQuestions);
  };

  const handleSaveQuiz = (): Quiz => {
    const quizId = `quiz_${Date.now()}`;
    const quiz: Quiz = {
      id: quizId,
      title: title.trim() || "Untitled Quiz",
      description: description.trim(),
      cover_image: coverImage.trim(),
      is_public: true,
      questions,
      created_at: new Date().toISOString(),
    };

    QuizStore.saveQuiz(quiz);
    return quiz;
  };

  const handleSaveAndHost = () => {
    const saved = handleSaveQuiz();
    const pin = generateGamePin();
    router.push(`/host/game/${pin}?quizId=${saved.id}`);
  };

  return (
    <div className="h-screen max-h-screen bg-[#141026] flex flex-col overflow-hidden">
      {/* Top Clean Header */}
      <CreatorHeader
        title={title}
        onTitleChange={setTitle}
        description={description}
        onDescriptionChange={setDescription}
        coverImage={coverImage}
        onCoverImageChange={setCoverImage}
        onSave={handleSaveQuiz}
        onSaveAndHost={handleSaveAndHost}
      />

      {/* Main Viewport */}
      <div className="flex-1 h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Slide List */}
        <SlideSidebar
          questions={questions}
          activeIndex={activeQuestionIndex}
          onSelect={setActiveQuestionIndex}
          onAddQuestion={handleAddQuestion}
        />

        {/* Center Question Canvas */}
        {activeQuestion && (
          <QuestionStage
            question={activeQuestion}
            questionNumber={activeQuestionIndex + 1}
            totalQuestions={questions.length}
            onChange={handleUpdateActiveQuestion}
            onDuplicate={handleDuplicateQuestion}
            onDelete={handleDeleteQuestion}
            canDelete={questions.length > 1}
          />
        )}
      </div>
    </div>
  );
}

export default function CreatorStudioPage() {
  return (
    <HostGuard>
      <CreatorStudioContent />
    </HostGuard>
  );
}
