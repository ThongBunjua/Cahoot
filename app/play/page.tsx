"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlayRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-kahoot-purple text-white flex items-center justify-center">
      <p className="text-lg font-bold">Redirecting to game...</p>
    </div>
  );
}
