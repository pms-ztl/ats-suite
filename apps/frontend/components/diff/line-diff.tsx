"use client";

/**
 * Line-level diff renderer — minimal LCS-based two-way diff for showing
 * what changed between two prompt versions.
 *
 * Why not pull in `diff` or `react-diff-viewer`: those add ~60 KB to the
 * client bundle for a 100-line algorithm. The text we're diffing is one
 * prompt at a time (typically <500 lines), so naive O(n*m) LCS is fine.
 *
 * Output: side-by-side or unified view, color-coded.
 */
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface DiffLine {
  kind: "ctx" | "add" | "del";
  oldNum: number | null;
  newNum: number | null;
  text: string;
}

/**
 * Compute a line-level diff between `a` (old) and `b` (new).
 * Uses LCS to find the longest common subsequence of lines, then walks
 * forward emitting ctx/add/del entries.
 */
function diff(a: string, b: string): DiffLine[] {
  const A = a.split("\n");
  const B = b.split("\n");
  const m = A.length;
  const n = B.length;
  // LCS DP table. Each cell stores the length of the longest common
  // subsequence ending at A[i], B[j].
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = A[i - 1] === B[j - 1] ? dp[i - 1]![j - 1]! + 1 : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
    }
  }
  // Walk the table backward to recover the diff
  const out: DiffLine[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (A[i - 1] === B[j - 1]) {
      out.push({ kind: "ctx", oldNum: i, newNum: j, text: A[i - 1]! });
      i--;
      j--;
    } else if (dp[i - 1]![j]! >= dp[i]![j - 1]!) {
      out.push({ kind: "del", oldNum: i, newNum: null, text: A[i - 1]! });
      i--;
    } else {
      out.push({ kind: "add", oldNum: null, newNum: j, text: B[j - 1]! });
      j--;
    }
  }
  while (i > 0) {
    out.push({ kind: "del", oldNum: i, newNum: null, text: A[i - 1]! });
    i--;
  }
  while (j > 0) {
    out.push({ kind: "add", oldNum: null, newNum: j, text: B[j - 1]! });
    j--;
  }
  out.reverse();
  return out;
}

interface Props {
  /** The "before" text. */
  oldText: string;
  /** The "after" text. */
  newText: string;
  /** Optional labels above each pane. */
  oldLabel?: string;
  newLabel?: string;
}

export function LineDiff({ oldText, newText, oldLabel = "Old", newLabel = "New" }: Props) {
  const [mode, setMode] = useState<"split" | "unified">("split");
  const lines = useMemo(() => diff(oldText, newText), [oldText, newText]);
  const adds = lines.filter((l) => l.kind === "add").length;
  const dels = lines.filter((l) => l.kind === "del").length;

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-muted/40">
        <div className="text-xs text-muted-foreground">
          <span className="text-green-700 dark:text-green-400 font-medium">+{adds}</span>
          {" / "}
          <span className="text-red-700 dark:text-red-400 font-medium">-{dels}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant={mode === "split" ? "default" : "ghost"} onClick={() => setMode("split")}>
            Split
          </Button>
          <Button size="sm" variant={mode === "unified" ? "default" : "ghost"} onClick={() => setMode("unified")}>
            Unified
          </Button>
        </div>
      </div>
      {mode === "split" ? <SplitView lines={lines} oldLabel={oldLabel} newLabel={newLabel} /> : <UnifiedView lines={lines} />}
    </div>
  );
}

function SplitView({ lines, oldLabel, newLabel }: { lines: DiffLine[]; oldLabel: string; newLabel: string }) {
  return (
    <div className="grid grid-cols-2 text-xs font-mono">
      {/* Old pane */}
      <div className="border-r overflow-x-auto">
        <div className="px-3 py-1.5 border-b bg-muted/30 text-muted-foreground font-sans text-xs">{oldLabel}</div>
        {lines.map((l, i) => {
          // In split view, "add"-only rows appear in the new pane only,
          // so we render an empty placeholder row here to keep line alignment.
          if (l.kind === "add") {
            return <div key={i} className="px-3 py-0.5 bg-muted/20">&nbsp;</div>;
          }
          return (
            <div
              key={i}
              className={`px-3 py-0.5 ${l.kind === "del" ? "bg-red-100 dark:bg-red-950/40" : ""}`}
            >
              <span className="text-muted-foreground inline-block w-8 select-none">{l.oldNum ?? ""}</span>
              <span className="whitespace-pre">{l.text || " "}</span>
            </div>
          );
        })}
      </div>
      {/* New pane */}
      <div className="overflow-x-auto">
        <div className="px-3 py-1.5 border-b bg-muted/30 text-muted-foreground font-sans text-xs">{newLabel}</div>
        {lines.map((l, i) => {
          if (l.kind === "del") {
            return <div key={i} className="px-3 py-0.5 bg-muted/20">&nbsp;</div>;
          }
          return (
            <div
              key={i}
              className={`px-3 py-0.5 ${l.kind === "add" ? "bg-green-100 dark:bg-green-950/40" : ""}`}
            >
              <span className="text-muted-foreground inline-block w-8 select-none">{l.newNum ?? ""}</span>
              <span className="whitespace-pre">{l.text || " "}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UnifiedView({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="text-xs font-mono overflow-x-auto">
      {lines.map((l, i) => {
        const prefix = l.kind === "add" ? "+" : l.kind === "del" ? "-" : " ";
        const bg =
          l.kind === "add"
            ? "bg-green-100 dark:bg-green-950/40"
            : l.kind === "del"
              ? "bg-red-100 dark:bg-red-950/40"
              : "";
        return (
          <div key={i} className={`px-3 py-0.5 ${bg}`}>
            <span className="text-muted-foreground inline-block w-6 select-none">{l.oldNum ?? ""}</span>
            <span className="text-muted-foreground inline-block w-6 select-none">{l.newNum ?? ""}</span>
            <span className="inline-block w-4 select-none">{prefix}</span>
            <span className="whitespace-pre">{l.text || " "}</span>
          </div>
        );
      })}
    </div>
  );
}
