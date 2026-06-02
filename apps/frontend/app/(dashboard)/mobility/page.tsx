"use client";
// app/(dashboard)/mobility/page.tsx, internal-mobility engine.
import { AIChip, Card, Button, EmptyState } from "@/components/aurora";
const MATCHES: [string, string, number][] = [
  ["Jordan Lee", "Support → Solutions Engineer", 86],
  ["Priya Sharma", "Coordinator → Recruiter", 79],
];
export default function MobilityPage() {
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Internal mobility</h1><p className="mt-1 text-ink-2">AI surfaces internal candidates for open roles. Reaching out is always your call.</p></header>
      {MATCHES.length === 0 ? (
        <EmptyState title="No internal matches yet" body="When employees opt in and roles open, suggested moves appear here." />
      ) : (
        <div className="flex flex-col gap-2">
          {MATCHES.map(([who, move, score]) => (
            <Card key={who} material="flat" className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
              <div className="min-w-0 flex-1"><div className="font-semibold">{who}</div><div className="text-xs text-ink-3">{move}</div></div>
              <AIChip>{String(score)} fit</AIChip>
              <Button variant="soft" size="sm">View match</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
