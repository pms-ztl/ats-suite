/**
 * Module D — interview room artifacts + collab tokens.
 * Mounted under /internal/interviews (rides the existing /api/interviews proxy):
 *   GET  /internal/interviews/:id/artifact        — load the saved notes/code/whiteboard
 *   PUT  /internal/interviews/:id/artifact        — upsert a snapshot from the room
 *   POST /internal/interviews/:id/collab-token    — mint a WS room token (host/guest)
 *   GET  /internal/interviews/:id/artifact/export — JSON bundle for the client PDF export
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

// PUT artifact — upsert a snapshot (room saves periodically + on end).
router.put("/:id/artifact", requireRoomMember, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const interviewId = req.params["id"] as string;
    const iv = await loadInterview(tenantId, interviewId);
    const body = UpsertInterviewArtifactSchema.parse(req.body);
    const data = {
      roundId: body.roundId ?? iv.roundId ?? null,
      notes: (body.notes ?? undefined) as any,
      notesText: body.notesText ?? undefined,
      code: body.code ?? undefined,
      codeLanguage: body.codeLanguage ?? undefined,
      whiteboard: (body.whiteboard ?? undefined) as any,
      whiteboardImageKey: body.whiteboardImageKey ?? undefined,
    };
    const artifact = await prisma.interviewArtifact.upsert({
      where: { interviewId },
      create: { tenantId, interviewId, ...data },
      update: data,
    });
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

// GET artifact/export — a flat JSON bundle (artifact + feedback) the client turns
// into a PDF (jsPDF). Kept server-side so the bundle is authoritative + access-gated.
router.get("/:id/artifact/export", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const interviewId = req.params["id"] as string;
    const iv = await loadInterview(tenantId, interviewId);
    const [artifact, feedback] = await Promise.all([
      prisma.interviewArtifact.findUnique({ where: { interviewId } }),
      prisma.interviewFeedback.findMany({ where: { interviewId } }),
    ]);
    ok(res, {
      interview: { id: iv.id, stage: iv.stage, type: iv.type, scheduledAt: iv.scheduledAt, candidateId: iv.candidateId },
      artifact,
      feedback: feedback.map((f) => ({ interviewerId: f.interviewerId, overallRating: f.overallRating, recommendation: f.recommendation, notes: f.notes, submittedAt: f.submittedAt })),
    });
  } catch (err) { next(err); }
});

export default router;
