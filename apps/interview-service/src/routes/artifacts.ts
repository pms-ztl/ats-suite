/**
 * Module D — interview room artifacts + collab tokens.
 * Mounted under /internal/interviews (rides the existing /api/interviews proxy):
 *   GET  /internal/interviews/:id/artifact         — load the saved notes/code/whiteboard
 *   PUT  /internal/interviews/:id/artifact         — NON-DESTRUCTIVE merge snapshot from the room
 *   POST /internal/interviews/:id/collab-token     — mint a WS room token (host/guest, authed)
 *   GET  /internal/interviews/:id/artifact/export  — JSON bundle OR printable HTML document
 * The GUEST (candidate, no-login) join lives in routes/public-room.ts.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors, getTenantId, requireRole } from "@cdc-ats/common";
import { UpsertInterviewArtifactSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";
import { signCollabToken, collabWsUrl } from "../lib/collab-token.js";

const router = Router({ mergeParams: true });
const requireRoomMember = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER");

async function loadInterview(tenantId: string, interviewId: string) {
  const iv = await prisma.interview.findFirst({ where: { id: interviewId, tenantId } });
  if (!iv) throw Errors.notFound("Interview");
  return iv;
}

// GET artifact
router.get("/:id/artifact", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const interviewId = req.params["id"] as string;
    await loadInterview(tenantId, interviewId);
    const artifact = await prisma.interviewArtifact.findUnique({ where: { interviewId } });
    ok(res, artifact); // null is honest "nothing saved yet"
  } catch (err) { next(err); }
});

// Treat "" / whitespace-only as "not provided" so an empty re-entry autosave can
// never blank previously saved content.
function nonBlank(v: string | null | undefined): boolean {
  return typeof v === "string" && v.trim().length > 0;
}
// A structured JSON doc counts as "present" when it is a non-empty object/array.
function hasJsonContent(v: unknown): boolean {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return true;
}

// PUT artifact — NON-DESTRUCTIVE merge. The room re-enters and autosaves; if a
// session starts before the shared doc has re-hydrated, its snapshot is empty.
// We must never clobber prior notes/code/whiteboard with that empty snapshot, so
// we load the existing artifact and only overwrite a field when the incoming
// value actually carries content (or there is nothing saved yet). Preserves all
// prior content across sessions (data-loss fix, constraint 6).
router.put("/:id/artifact", requireRoomMember, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const interviewId = req.params["id"] as string;
    const iv = await loadInterview(tenantId, interviewId);
    const body = UpsertInterviewArtifactSchema.parse(req.body);

    const existing = await prisma.interviewArtifact.findUnique({ where: { interviewId } });

    if (!existing) {
      // First save — persist whatever the room provided.
      const created = await prisma.interviewArtifact.create({
        data: {
          tenantId,
          interviewId,
          roundId: body.roundId ?? iv.roundId ?? null,
          notes: (body.notes ?? undefined) as any,
          notesText: body.notesText ?? undefined,
          code: body.code ?? undefined,
          codeLanguage: body.codeLanguage ?? undefined,
          whiteboard: (body.whiteboard ?? undefined) as any,
          whiteboardImageKey: body.whiteboardImageKey ?? undefined,
        },
      });
      return ok(res, created);
    }

    // Merge: only replace a field when the incoming value carries content, OR the
    // stored field is itself empty (so genuine first-content still lands). This is
    // load-then-update — a blank field in the payload is a no-op, never a wipe.
    const update: Record<string, unknown> = {};
    if (body.roundId !== undefined && body.roundId !== null) update["roundId"] = body.roundId;

    if (nonBlank(body.notesText) || (!nonBlank(existing.notesText) && body.notesText !== undefined))
      update["notesText"] = body.notesText;
    if (hasJsonContent(body.notes) || (!hasJsonContent(existing.notes) && body.notes !== undefined))
      update["notes"] = body.notes as any;

    if (nonBlank(body.code) || (!nonBlank(existing.code) && body.code !== undefined))
      update["code"] = body.code;
    if (body.codeLanguage !== undefined) update["codeLanguage"] = body.codeLanguage;

    if (nonBlank(body.whiteboardImageKey) || (!nonBlank(existing.whiteboardImageKey) && body.whiteboardImageKey !== undefined))
      update["whiteboardImageKey"] = body.whiteboardImageKey;
    if (hasJsonContent(body.whiteboard) || (!hasJsonContent(existing.whiteboard) && body.whiteboard !== undefined))
      update["whiteboard"] = body.whiteboard as any;

    const artifact = Object.keys(update).length
      ? await prisma.interviewArtifact.update({ where: { interviewId }, data: update })
      : existing;
    ok(res, artifact);
  } catch (err) { next(err); }
});

// POST collab-token — mint a short-lived WS room token. `role=guest` for the
// candidate link; default `host` for staff. The roomId is the interview id.
router.post("/:id/collab-token", requireRoomMember, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const interviewId = req.params["id"] as string;
    await loadInterview(tenantId, interviewId);
    const role = (req.body?.role === "guest" ? "guest" : "host") as "host" | "guest";
    const displayName = typeof req.body?.displayName === "string" && req.body.displayName.trim()
      ? String(req.body.displayName).slice(0, 80)
      : (role === "guest" ? "Candidate" : "Interviewer");
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 4; // 4h
    const token = signCollabToken({ roomId: interviewId, role, displayName, exp });
    ok(res, { token, roomId: interviewId, role, displayName, wsUrl: collabWsUrl(), expiresAt: new Date(exp * 1000).toISOString() });
  } catch (err) { next(err); }
});

// ── PDF / document export ────────────────────────────────────────────────────
// GET /:id/artifact/export — returns the FULL record (notes + code + whiteboard +
// feedback). Two representations, negotiated so the route stays stable:
//   • default (JSON)            — the authoritative bundle the client PDF uses.
//   • ?format=html / Accept html — a self-contained, printable document the
//     browser can save as PDF (window.print()), for callers without jsPDF.
router.get("/:id/artifact/export", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const interviewId = req.params["id"] as string;
    const iv = await loadInterview(tenantId, interviewId);
    const [artifact, feedback] = await Promise.all([
      prisma.interviewArtifact.findUnique({ where: { interviewId } }),
      prisma.interviewFeedback.findMany({ where: { interviewId } }),
    ]);
    const bundle = {
      interview: { id: iv.id, stage: iv.stage, type: iv.type, scheduledAt: iv.scheduledAt, candidateId: iv.candidateId },
      artifact,
      feedback: feedback.map((f) => ({ interviewerId: f.interviewerId, overallRating: f.overallRating, recommendation: f.recommendation, notes: f.notes, submittedAt: f.submittedAt })),
    };

    const wantsHtml =
      String(req.query["format"] ?? "").toLowerCase() === "html" ||
      (typeof req.headers.accept === "string" && req.headers.accept.includes("text/html"));
    if (wantsHtml) {
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Content-Disposition", `inline; filename="interview-${interviewId}.html"`);
      return res.send(renderExportHtml(bundle));
    }
    ok(res, bundle);
  } catch (err) { next(err); }
});

// Server-rendered, dependency-free printable document. Real content only; empty
// sections render an honest "(none)". Escaped to prevent HTML injection from
// stored notes/code.
function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => (
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;"
  ));
}
function renderExportHtml(b: {
  interview: { id: string; stage: string; type: unknown; scheduledAt: unknown; candidateId: string };
  artifact: { notesText: string | null; code: string | null; codeLanguage: string; whiteboardImageKey: string | null } | null;
  feedback: Array<{ interviewerId: string; overallRating: number; recommendation: string; notes: string | null; submittedAt: unknown }>;
}): string {
  const a = b.artifact;
  const notes = a?.notesText && a.notesText.trim() ? esc(a.notesText) : "<em>(none)</em>";
  const code = a?.code && a.code.trim() ? esc(a.code) : "";
  const wb = a?.whiteboardImageKey && /^data:image\//.test(a.whiteboardImageKey)
    ? `<img src="${esc(a.whiteboardImageKey)}" alt="Whiteboard" style="max-width:100%;border:1px solid #ccc;border-radius:8px" />`
    : "<em>(none)</em>";
  const fb = b.feedback.length
    ? b.feedback.map((f) => `<li><strong>${esc(f.recommendation)}</strong> · rating ${esc(f.overallRating)}/5${f.notes ? ` — ${esc(f.notes)}` : ""}</li>`).join("")
    : "<li><em>No feedback submitted.</em></li>";
  const when = b.interview.scheduledAt ? esc(new Date(String(b.interview.scheduledAt)).toUTCString()) : "unscheduled";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<title>Interview record ${esc(b.interview.id)}</title>
<style>
  body{font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;max-width:820px;margin:32px auto;padding:0 20px}
  h1{font-size:20px;margin:0 0 4px} .meta{color:#666;font-size:12px;margin-bottom:20px}
  h2{font-size:15px;border-bottom:1px solid #ddd;padding-bottom:4px;margin:22px 0 10px}
  pre{background:#f6f8fa;border:1px solid #e1e4e8;border-radius:8px;padding:12px;overflow:auto;white-space:pre-wrap}
  .notes{white-space:pre-wrap} ul{padding-left:18px}
  @media print{body{margin:0}}
</style></head><body>
  <h1>Interview record</h1>
  <div class="meta">Interview ${esc(b.interview.id)} · ${esc(b.interview.stage)} · ${when}</div>
  <h2>Notes</h2><div class="notes">${notes}</div>
  <h2>Code (${esc(a?.codeLanguage ?? "text")})</h2>${code ? `<pre>${code}</pre>` : "<em>(none)</em>"}
  <h2>Whiteboard</h2>${wb}
  <h2>Feedback</h2><ul>${fb}</ul>
</body></html>`;
}

export default router;
