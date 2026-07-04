"use client";
// Module D — PUBLIC guest join for the tenant's OWN built-in interview room.
// Contract (produced by interview-room/Lane 1, rendered here):
//   ${APP_URL}/interview/room/{interviewId}?t=<joinToken>
// The opaque signed join token in ?t= is the ONLY credential — a candidate joins
// with NO account/login. We NEVER render an external meeting URL (Zoom/Meet/Teams);
// the room is our own WebRTC + collab-service relay.
//
// Flow: a small pre-join card asks for a display name, validates the token via
// Lane 1's PUBLIC endpoint (POST /api/public/interview/join), and on success mounts
// the built-in <InterviewRoom> in guest mode (which itself re-validates + swaps the
// join token for a collab room token). An invalid/expired/missing token shows an
// honest error — no room, no fabricated session.
import { Suspense, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { Icon } from "@/components/aurora-icon";

// The room is browser-only (WebRTC, Monaco, Yjs) so it is SSR-disabled.
const InterviewRoom = dynamic(
  () => import("@/components/cd/interview-room/InterviewRoom").then((m) => m.InterviewRoom),
  { ssr: false, loading: () => <div style={{ padding: 24, color: "#8b93a7" }}>Loading interview room…</div> },
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function GuestInterviewRoomInner() {
  const params = useParams();
  const search = useSearchParams();
  const interviewId = String(params?.["interviewId"] ?? "");
  const joinToken = search?.get("t") ?? "";

  const [name, setName] = useState("");
  const [phase, setPhase] = useState<"idle" | "validating" | "joined" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  // A guest link is only usable with BOTH an interview id and a token.
  const linkOk = useMemo(() => Boolean(interviewId && joinToken), [interviewId, joinToken]);

  async function join(e?: React.FormEvent) {
    e?.preventDefault();
    if (!linkOk) return;
    setPhase("validating");
    setErrMsg("");
    try {
      // Validate the join token up front so we can show an honest error before we
      // drop the candidate into a broken room. This mirrors the exact request the
      // room hook makes on mount, so a 200 here means the room will connect.
      const res = await fetch(`${API_BASE}/public/interview/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: joinToken, displayName: name.trim() || "Candidate" }),
      });
      if (!res.ok) {
        setErrMsg(
          res.status === 401 || res.status === 403
            ? "This interview link is invalid or has expired. Please ask your recruiter for a new one."
            : "We could not join the interview room right now. Please try again in a moment.",
        );
        setPhase("error");
        return;
      }
      setPhase("joined");
    } catch {
      setErrMsg("We could not reach the interview room. Check your connection and try again.");
      setPhase("error");
    }
  }

  // Once joined, hand off to the built-in room in guest mode (full-bleed overlay).
  if (phase === "joined") {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
        <InterviewRoom interviewId={interviewId} joinToken={joinToken} guestName={name.trim() || "Candidate"} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "var(--c-bg, #0d1117)" }}>
      <div
        style={{
          width: "100%", maxWidth: 440, background: "var(--c-surface, #161b22)", color: "var(--c-ink, #e6edf3)",
          border: "1px solid var(--c-line, #1f2430)", borderRadius: 16, padding: 28, boxShadow: "var(--e1, 0 8px 30px rgba(0,0,0,.4))",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--c-brand, #4dd4ac)", color: "#08110d", display: "grid", placeItems: "center" }}>
            <Icon name="users" size={20} />
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}>Join your interview</div>
            <div style={{ fontSize: 12.5, color: "var(--c-ink-3, #8b93a7)" }}>Secure, in-browser video and collaboration</div>
          </div>
        </div>

        {!linkOk ? (
          <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 12, background: "rgba(255,80,80,.08)", border: "1px solid rgba(255,80,80,.25)" }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>This interview link is incomplete</div>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-ink-2, #b7c0cd)", lineHeight: 1.5 }}>
              The link is missing its access token. Please use the full link from your interview invitation, or ask your recruiter to resend it.
            </p>
          </div>
        ) : (
          <form onSubmit={join} style={{ marginTop: 18 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2, #b7c0cd)", marginBottom: 7 }}>
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              autoFocus
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--c-line-2, #2a2f3a)",
                background: "var(--c-surface-2, #0d1117)", color: "var(--c-ink, #e6edf3)", fontSize: 14, outline: "none",
              }}
            />
            <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--c-ink-3, #8b93a7)", lineHeight: 1.5, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <Icon name="shield" size={13} style={{ marginTop: 1, flexShrink: 0 }} />
              This opens the hiring team's own video room in your browser. You do not need an account or any external app.
            </p>

            {phase === "error" && (
              <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 10, background: "rgba(255,80,80,.08)", border: "1px solid rgba(255,80,80,.25)", fontSize: 12.5, color: "var(--c-ink-2, #b7c0cd)", lineHeight: 1.5 }}>
                {errMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={phase === "validating"}
              style={{
                marginTop: 16, width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid transparent",
                background: "var(--c-brand, #4dd4ac)", color: "#08110d", fontWeight: 700, fontSize: 14,
                cursor: phase === "validating" ? "default" : "pointer", opacity: phase === "validating" ? 0.7 : 1,
                display: "inline-flex", gap: 8, alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon name="enter" size={16} />
              {phase === "validating" ? "Connecting…" : "Join interview room"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function GuestInterviewRoomPage() {
  // useSearchParams must sit under a Suspense boundary (Next.js app router idiom,
  // matching the auth/verify-email pages).
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#8b93a7" }}>Loading…</div>}>
      <GuestInterviewRoomInner />
    </Suspense>
  );
}
