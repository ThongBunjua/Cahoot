"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const pin = searchParams.get("pin");
    if (pin) {
      router.replace(`/?pin=${pin}`);
    } else {
      router.replace("/");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-kahoot-purple text-white flex items-center justify-center">
      <p className="text-lg font-bold">Joining game room...</p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-kahoot-purple text-white flex items-center justify-center">
          <p className="text-lg font-bold">Joining game room...</p>
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
