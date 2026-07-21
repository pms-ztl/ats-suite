"use client";
// Module G — candidate summary export. Generates a concise, professional one-doc
// summary (name, contact incl. phone, AI alignment score + derived dimensions,
// skills, experience, education, resume tags, interview scores, stage, recruiter
// notes) as PDF or Word — the intelligent summary a decision-maker needs without
// dumping the whole resume. Real data or honest-empty; empty sections are dropped.
import * as React from "react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportDocToPDF, exportDocToDOCX, type ExportDoc } from "@/lib/export";

export interface CandidateSummary {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  role?: string | null;
  stage?: string | null;
  score?: number | null;
  band?: string | null;
  // Structured, app-derived lines (AI verdict summary + the two mandated
  // alignment dimensions) — never contain raw resume prose, always safe to
  // show under blind review.
  aiSummaryLines?: string[];
  // Raw free text pulled straight from the parsed resume. Parser-generated
  // summaries routinely open with the candidate's own name as prose (e.g.
  // "Jane Doe\nCandidate for Backend Engineer\n..."), so this is NOT safe
  // under blind review and is dropped entirely below rather than redacted
  // line-by-line — there is no reliable way to redact free text you don't
  // control the shape of.
  parsedResumeSummary?: string | null;
  skills?: string[];
  tags?: string[];
  experience?: string[];
  education?: string[];
  strengths?: string[];
  missing?: string[];
  interviewScores?: string[]; // real per-interview ratings, e.g. "Technical round: 4/5 (strong yes)"
  notes?: string[];
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;

// Backstop for blind exports. buildDoc only feeds through fields that are
// ALREADY known to be identity-safe when blind is true (see the field
// comments above) — this must never be the only guard. It exists so that if
// a future field is added to CandidateSummary and someone forgets to gate it
// above, an accidental name/email leak still gets caught here instead of
// shipping in the file.
function isBlindUnsafe(line: string, realName: string): boolean {
  const name = realName.trim().toLowerCase();
  if (name && line.toLowerCase().includes(name)) return true;
  return EMAIL_RE.test(line);
}

function buildDoc(c: CandidateSummary, blind: boolean): ExportDoc {
  const sec = (heading: string, lines: (string | null | undefined)[]) => ({
    heading,
    lines: lines.map((l) => (l ?? "").toString()).filter((l) => l.trim().length > 0),
  });
  const displayName = blind ? `Candidate ${(c.id ?? "").toUpperCase() || "UNKNOWN"}` : c.name;
  // Blind mode never has contact details to show, so it gets its own section
  // name instead of an empty-looking "Contact" heading over just a role/stage.
  const sections = [
    sec(blind ? "Application" : "Contact", blind
      ? [
          c.role ? `Applying for: ${c.role}` : null,
          c.stage ? `Hiring stage: ${c.stage}` : null,
        ]
      : [
          c.email ? `Email: ${c.email}` : null,
          c.phone ? `Phone: ${c.phone}` : null,
          c.location ? `Location: ${c.location}` : null,
          c.role ? `Applying for: ${c.role}` : null,
          c.stage ? `Hiring stage: ${c.stage}` : null,
        ]),
    sec("AI alignment", [
      c.score != null ? `Match score: ${Math.round(c.score)}%${c.band ? ` (${c.band})` : ""}` : null,
      ...(c.aiSummaryLines ?? []),
      ...(!blind && c.parsedResumeSummary ? c.parsedResumeSummary.split("\n").map((l) => l.trim()).filter(Boolean) : []),
    ]),
    sec("Skills", c.skills?.length ? [c.skills.join(", ")] : ["(none captured)"]),
    sec("Strengths", c.strengths ?? []),
    sec("Missing / gaps", c.missing ?? []),
    sec("Interview scores", c.interviewScores ?? []),
    sec("Experience", c.experience ?? []),
    sec("Education", c.education ?? []),
    sec("Resume tags", c.tags?.length ? [c.tags.join(", ")] : []),
    sec("Recruiter notes", blind ? [] : (c.notes ?? [])),
  ]
    .map((s) => (blind ? { ...s, lines: s.lines.filter((l) => !isBlindUnsafe(l, c.name)) } : s))
    .filter((s) => s.lines.length > 0);

  return {
    filename: `candidate-${displayName.replace(/\s+/g, "-").toLowerCase()}-summary`,
    title: displayName,
    subtitle: [c.role, c.stage].filter(Boolean).join(" · ") || undefined,
    sections,
  };
}

export function CandidateSummaryExport({ candidate, label = "Export summary", blind = false }: { candidate: CandidateSummary; label?: string; blind?: boolean }) {
  const [busy, setBusy] = React.useState(false);
  const run = async (fmt: "pdf" | "docx") => {
    // buildDoc() itself owns all blind redaction (see its comments) — this is
    // just making sure nobody is surprised by that after the fact. A native
    // confirm() is deliberately used instead of a styled dialog: it's blocking,
    // unmissable, and forces the short/plain wording this needs — no custom
    // modal plumbing for a gate this rare (only fires when blind + export
    // actually intersect).
    if (blind && !window.confirm("Blind review is on — this export will exclude name, email, phone, and location. Continue?")) return;
    try {
      setBusy(true);
      const doc = buildDoc(candidate, blind);
      if (fmt === "pdf") await exportDocToPDF(doc);
      else await exportDocToDOCX(doc);
    } finally { setBusy(false); }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={busy}>{busy ? "Exporting…" : label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Candidate summary</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void run("pdf")}>PDF (.pdf)</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void run("docx")}>Word (.docx)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
