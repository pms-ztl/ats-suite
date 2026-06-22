import { z } from "zod";

// ── Module D — Interview room artifacts + realtime collab ─────────────────────
// The built-in interview room hosts P2P video (own WebRTC signaling) plus three
// co-edited surfaces: structured Notes, a live Code editor, and a Whiteboard.
// Their content is snapshotted to interview-service as an InterviewArtifact so it
// outlives the call, becomes part of the candidate's record, and can be exported
// to PDF as hiring justification.

export const InterviewArtifactDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  interviewId: z.string().uuid(),
  roundId: z.string().uuid().nullable(),
  /** Tiptap/ProseMirror JSON document for the collaborative notes. */
  notes: z.unknown().nullable(),
  /** Plain-text notes fallback (rendered into the PDF + searchable). */
  notesText: z.string().nullable(),
  /** Live code editor contents. */
  code: z.string().nullable(),
  codeLanguage: z.string().default("typescript"),
  /** tldraw snapshot JSON for the whiteboard. */
  whiteboard: z.unknown().nullable(),
  /** Optional rasterized whiteboard (data URL / storage key) for the PDF bundle. */
  whiteboardImageKey: z.string().nullable(),
  updatedAt: z.string().datetime(),
});
export type InterviewArtifactDTO = z.infer<typeof InterviewArtifactDTOSchema>;

export const UpsertInterviewArtifactSchema = z.object({
  roundId: z.string().uuid().nullable().optional(),
  notes: z.unknown().optional(),
  notesText: z.string().optional(),
  code: z.string().optional(),
  codeLanguage: z.string().optional(),
  whiteboard: z.unknown().optional(),
  whiteboardImageKey: z.string().optional(),
});
export type UpsertInterviewArtifact = z.infer<typeof UpsertInterviewArtifactSchema>;

// A short-lived token the frontend exchanges to join a collab room. interview-
// service mints it (scoped to interviewId + role) and the collab-service WS hub
// validates it on connect — so a room cannot be joined without a server grant.
export const CollabTokenDTOSchema = z.object({
  token: z.string().min(16),
  roomId: z.string().min(1),
  /** "host" (interviewer/panel) or "guest" (candidate). */
  role: z.enum(["host", "guest"]),
  /** Display name shown on the participant's video tile. */
  displayName: z.string(),
  /** WS endpoint the client should connect to (e.g. wss://…/rt). */
  wsUrl: z.string(),
  expiresAt: z.string().datetime(),
});
export type CollabTokenDTO = z.infer<typeof CollabTokenDTOSchema>;
