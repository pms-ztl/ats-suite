"use client";
// app/(portal)/profile/page.tsx, candidate account home.
import { Card, Button } from "@/components/aurora";
const APPS = [
  ["Senior Backend Engineer", "Northwind Talent", "Under review"],
  ["Platform Engineer", "Helios Robotics", "Interview"],
] as const;
export default function CandidateProfilePage() {
  return (
    <div className="mx-auto w-full max-w-[820px] p-6">
      <header className="mb-6"><h1 className="text-3xl font-extrabold tracking-tight">Hi, Jordan.</h1><p className="mt-1 text-ink-2">Your applications, résumé, and interviews in one place.</p></header>
      <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
        <Card material="clay" className="rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-3">My applications</h2>
          <div className="flex flex-col gap-2">
            {APPS.map(([role, co, stage]) => (
              <a key={role} href="/status"><div className="rounded-lg border border-line bg-surface p-3 hover:bg-surface-2">
                <div className="font-semibold">{role}</div><div className="text-xs text-ink-3">{co} · {stage}</div>
              </div></a>
            ))}
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Card material="flat" className="rounded-2xl border border-line p-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-3">Résumé</h2>
            <p className="text-sm text-ink-3">Jordan-Avery-Resume.pdf · 284 KB</p>
            <Button variant="soft" size="sm" className="mt-3">Replace</Button>
          </Card>
          <Card material="flat" className="rounded-2xl border border-line p-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-3">Profile</h2>
            <p className="text-sm text-ink-3">jordan.avery@hey.com · Austin, TX</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
