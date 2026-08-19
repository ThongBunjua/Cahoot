"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Quiz, Question } from "@/lib/realtime/types";
import { QuizStore } from "@/lib/store/quizStore";
import { CreatorHeader } from "@/components/creator/CreatorHeader";
import { SlideSidebar } from "@/components/creator/SlideSidebar";
import { QuestionStage } from "@/components/creator/QuestionStage";
import { generateGamePin } from "@/lib/utils/pinGenerator";

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

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState("My Quiz");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    if (!quizId) return;
    const found = QuizStore.getQuizById(quizId);
    if (found) {
      setQuiz(found);
      setTitle(found.title);
      setDescription(found.description);
      setCoverImage(found.cover_image);
      setQuestions(found.questions);
    } else {
      router.push("/quizzes");
    }
  }, [quizId, router]);

  if (!quiz) {
    return (
      <div className="h-screen bg-[#141026] text-white flex items-center justify-center">
        <p className="text-xl font-bold">Loading quiz...</p>
      </div>
    );
  }

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
    const updatedQuiz: Quiz = {
      ...quiz,
      title: title.trim() || "Untitled Quiz",
      description: description.trim(),
      cover_image: coverImage.trim(),
      questions,
    };

    QuizStore.saveQuiz(updatedQuiz);
    return updatedQuiz;
  };

  const handleSaveAndHost = () => {
    const saved = handleSaveQuiz();
    const pin = generateGamePin();
    router.push(`/host/game/${pin}?quizId=${saved.id}`);
  };

  return (
    <div className="h-screen max-h-screen bg-[#141026] flex flex-col overflow-hidden">
      {/* Top Header Bar */}
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
        <SlideSidebar
          questions={questions}
          activeIndex={activeQuestionIndex}
          onSelect={setActiveQuestionIndex}
          onAddQuestion={handleAddQuestion}
        />

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
