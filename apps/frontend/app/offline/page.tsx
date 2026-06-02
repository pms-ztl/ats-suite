// app/offline/page.tsx, offline state (also served by the service worker fallback).
import Link from "next/link";
import { EmptyState } from "@/components/aurora";
export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <EmptyState title="You are offline" body="We could not reach the network. Check your connection, and we will reconnect you the moment you are back online."
        actions={<Link href="/" className="rounded-pill bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand">Retry</Link>} />
    </main>
  );
}
