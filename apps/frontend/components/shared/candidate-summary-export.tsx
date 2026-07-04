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
  name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  role?: string | null;
  stage?: string | null;
  score?: number | null;
  band?: string | null;
  scoreSummary?: string | null;
  skills?: string[];
  tags?: string[];
  experience?: string[];
  education?: string[];
  strengths?: string[];
  missing?: string[];
  interviewScores?: string[]; // real per-interview ratings, e.g. "Technical round: 4/5 (strong yes)"
  notes?: string[];
}

function buildDoc(c: CandidateSummary): ExportDoc {
  const sec = (heading: string, lines: (string | null | undefined)[]) => ({
    heading,
    lines: lines.map((l) => (l ?? "").toString()).filter((l) => l.trim().length > 0),
  });
  const sections = [
    sec("Contact", [
      c.email ? `Email: ${c.email}` : null,
      c.phone ? `Phone: ${c.phone}` : null,
      c.location ? `Location: ${c.location}` : null,
      c.role ? `Applying for: ${c.role}` : null,
      c.stage ? `Hiring stage: ${c.stage}` : null,
    ]),
    sec("AI alignment", [
      c.score != null ? `Match score: ${Math.round(c.score)}%${c.band ? ` (${c.band})` : ""}` : null,
      // scoreSummary may carry the advisory summary + derived dimension lines +
      // the parsed resume summary, newline-joined; split so each renders cleanly.
      ...((c.scoreSummary ?? "").split("\n").map((l) => l.trim()).filter(Boolean)),
    ]),
    sec("Skills", c.skills?.length ? [c.skills.join(", ")] : ["(none captured)"]),
    sec("Strengths", c.strengths ?? []),
    sec("Missing / gaps", c.missing ?? []),
    sec("Interview scores", c.interviewScores ?? []),
    sec("Experience", c.experience ?? []),
    sec("Education", c.education ?? []),
    sec("Resume tags", c.tags?.length ? [c.tags.join(", ")] : []),
    sec("Recruiter notes", c.notes ?? []),
  ].filter((s) => s.lines.length > 0);

  return {
    filename: `candidate-${c.name.replace(/\s+/g, "-").toLowerCase()}-summary`,
    title: c.name,
    subtitle: [c.role, c.stage].filter(Boolean).join(" · ") || undefined,
    sections,
  };
}

export function CandidateSummaryExport({ candidate, label = "Export summary" }: { candidate: CandidateSummary; label?: string }) {
  const [busy, setBusy] = React.useState(false);
  const run = async (fmt: "pdf" | "docx") => {
    try {
      setBusy(true);
      const doc = buildDoc(candidate);
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
