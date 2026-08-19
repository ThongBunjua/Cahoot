"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HostRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/quizzes");
  }, [router]);

  return (
    <div className="min-h-screen bg-kahoot-dark text-white flex items-center justify-center">
      <p className="text-lg font-bold">Redirecting to Quiz Hub...</p>
    </div>
  );
}
