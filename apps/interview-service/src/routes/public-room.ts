/**
 * Module D — PUBLIC guest join for the built-in interview room (candidate, NO login).
 *
 * A candidate's interview invite carries the tenant's OWN built-in room link:
 *   `${APP_URL}/interview/room/{interviewId}?t=<joinToken>`
 * The opaque join token (minted in built-in-room.ts) IS the credential — the
 * candidate has no account, no JWT, no tenant header. This router mirrors the
 * job-service /public and assessment public-take posture: mounted WITHOUT
 * readAuthHeaders, reachable via a raw gateway proxy (no X-Internal-Service
 * stamp), tenant resolved from the token row via the admin client.
 *
 *   POST /public/interview/join   { token, displayName? }
 *     → validate the token, return a short-lived collab-service room token + WS URL
 *       so the guest can enter the tenant's OWN WebRTC room. Never an external tool.
 *
 * No PII is returned beyond the room id + a generic display name.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors } from "@cdc-ats/common";
import { prismaAdmin } from "../lib/prisma.js";
import { signCollabToken, collabWsUrl } from "../lib/collab-token.js";
import { verifyGuestJoinToken } from "../lib/built-in-room.js";

const router = Router();

router.post("/join", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken =
      (typeof req.body?.token === "string" && req.body.token) ||
      (typeof req.query?.["t"] === "string" && (req.query["t"] as string)) ||
      "";
    const claims = verifyGuestJoinToken(rawToken);
    if (!claims) throw Errors.unauthorized("Invalid or expired interview join link");
    const interviewId = claims.interviewId;

    // The token is the grant; guests carry no tenant context. Admin client, lookup
    // by id only — the signed token already binds this exact interview.
    const iv = await prismaAdmin.interview.findUnique({
      where: { id: interviewId },
      select: { id: true, status: true, scheduledAt: true },
    });
    if (!iv) throw Errors.notFound("Interview");

    const displayName =
      typeof req.body?.displayName === "string" && req.body.displayName.trim()
        ? String(req.body.displayName).slice(0, 80)
        : "Candidate";

    // Mint the collab room token (guest role) the WS hub validates on connect.
    // Bounded to the remaining life of the join grant, capped at 4h per session.
    const exp = Math.min(claims.exp, Math.floor(Date.now() / 1000) + 60 * 60 * 4);
    const roomToken = signCollabToken({ roomId: interviewId, role: "guest", displayName, exp });

    ok(res, {
      token: roomToken,
      roomId: interviewId,
      interviewId,
      role: "guest",
      displayName,
      wsUrl: collabWsUrl(),
      scheduledAt: iv.scheduledAt,
      expiresAt: new Date(exp * 1000).toISOString(),
    });
  } catch (err) { next(err); }
});

export default router;
