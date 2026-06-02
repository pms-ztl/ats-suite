// app/not-found.tsx, 404.
import Link from "next/link";
import { EmptyState } from "@/components/aurora";
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <EmptyState title="This page wandered off" body="The link you followed does not exist, or it moved somewhere new."
        actions={<Link href="/" className="rounded-pill bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand">Back to dashboard</Link>} />
    </main>
  );
}
