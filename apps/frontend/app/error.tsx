"use client";
// app/error.tsx, 500 / error boundary.
import { ErrorState } from "@/components/aurora";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <ErrorState title="Something broke on our end" body="This one is on us, not you. We have logged it and our team is on it."
        code={error.digest} onRetry={reset} />
    </main>
  );
}
