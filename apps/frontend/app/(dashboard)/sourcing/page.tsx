"use client";
// app/(dashboard)/sourcing/page.tsx — AI sourcing.
// The "Find candidates" button triggers a REAL AI candidate search: it POSTs the
// free-text "who I need" description to /api/sourcing/search, which ranks the
// tenant's OWN candidate pool with the sourcing agent (real LLM via the
// ai-engine) and returns matches with grounded evidence. No fabricated people —
// every row is a real Candidate; an empty pool / no match shows an honest empty
// state, and a transport failure shows an honest error.
import { useState } from "react";
import { Button, Card, AIChip } from "@/components/aurora";
import { SceneArt } from "@/components/shared/scene-art";
import { sourceCandidates, type SourcingResult } from "@/lib/api";

function scoreTone(score: number): string {
  if (score >= 75) return "text-ok bg-ok-tint";
  if (score >= 50) return "text-warn bg-warn-tint";
  return "text-ink-3 bg-surface-3";
}

export default function SourcingPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SourcingResult | null>(null);

  async function find() {
    const query = q.trim();
    if (query.length < 2 || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await sourceCandidates(query, 10));
    } catch {
      setError(
        "Couldn't run the sourcing search just now. The AI model service may be rate-limited (the demo runs on a free tier) or temporarily busy — please try again in a moment.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">AI sourcing</h1>
        <p className="mt-1 text-ink-2">Describe who you need. The sourcing agent surfaces matches with evidence, you decide who to reach.</p>
      </header>

      <Card material="glass" className="mb-4 flex flex-wrap gap-2 rounded-2xl p-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void find(); }}
          placeholder="e.g. Senior backend engineer, Go, payments, remote"
          className="h-11 flex-1 rounded border border-line-2 bg-surface px-3 outline-none focus-visible:shadow-ring"
        />
        {/* POST /api/sourcing/search */}
        <Button variant="ai" onClick={() => void find()} disabled={loading || q.trim().length < 2}>
          {loading ? "Searching…" : "Find candidates"}
        </Button>
      </Card>

      {/* Loading — the agent is ranking the real pool. */}
      {loading && (
        <Card material="flat" className="mb-4 flex items-center gap-3 p-4 text-ink-2">
          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-ai" aria-hidden="true" />
          Ranking your candidate pool against “{q.trim()}”…
        </Card>
      )}

      {/* Honest error — never a fabricated result. */}
      {error && !loading && (
        <Card material="flat" className="mb-4 border border-danger-tint p-4 text-danger">
          {error}
        </Card>
      )}

      {/* Results / honest empty. */}
      {result && !loading && !error && (
        result.matches.length > 0 ? (
          <section aria-label="Sourcing results">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-ink-2">
              <AIChip>{result.usedLLM ? "AI · ranked" : "Keyword match"}</AIChip>
              <span>
                {result.matches.length} match{result.matches.length === 1 ? "" : "es"} from {result.scanned} candidate{result.scanned === 1 ? "" : "s"}
                {result.modelName ? ` · ${result.modelName}` : ""}
              </span>
            </div>
            {result.summary && <p className="mb-3 text-sm text-ink-2">{result.summary}</p>}
            <ul className="flex flex-col gap-2">
              {result.matches.map((m) => (
                <li key={m.candidateId}>
                  <Card material="flat" className="flex items-start gap-3 p-4">
                    <span className={`mt-0.5 inline-flex min-w-[44px] justify-center rounded-pill px-2.5 py-1 text-sm font-bold ${scoreTone(m.score)}`}>
                      {m.score}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold text-ink">{m.name}</span>
                        {m.role && <span className="text-sm text-ink-2">· {m.role}</span>}
                      </div>
                      {m.evidence && <p className="mt-1 text-sm leading-relaxed text-ink-2">{m.evidence}</p>}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <Card material="flat" className="p-6">
            <SceneArt
              scene="radar"
              maxWidth={360}
              title={result.scanned === 0 ? "No candidates in your pool yet" : "No matches for that description"}
              body={result.summary
                ?? (result.scanned === 0
                  ? "Import or receive applications to build a searchable talent base, then describe who you need."
                  : "Try broadening the role, skills, or seniority in your description.")}
            />
          </Card>
        )
      )}

      {/* Initial idle state. */}
      {!result && !loading && !error && (
        <div style={{ padding: "26px 0 10px" }}>
          <SceneArt
            scene="radar"
            maxWidth={400}
            title="Describe your ideal candidate"
            body="The sourcing agent ranks people by fit and shows the evidence behind every match. Your results appear here."
          />
        </div>
      )}
    </div>
  );
}
