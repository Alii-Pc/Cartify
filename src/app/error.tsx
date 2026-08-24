"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <ErrorState
          title="Something went wrong"
          message={error.message || "An unexpected error occurred."}
          onRetry={reset}
        />
      </div>
    </div>
  );
}
