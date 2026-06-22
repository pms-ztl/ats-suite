"use client";
// Module D — the built-in interview room. Own-WebRTC P2P video (no Zoom/Meet/
// Teams), with three co-edited surfaces — Notes, Code, Whiteboard — all synced
// live via the shared Y.Doc and snapshotted to the candidate's interview record.
// Everything is exportable to PDF as hiring justification.
import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCollabRoom } from "@/lib/collab/use-collab-room";
import { CollabNotes } from "./CollabNotes";
import { CollabCode } from "./CollabCode";
import { CollabWhiteboard, type WhiteboardHandle } from "./CollabWhiteboard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}

function VideoTile({ stream, label, muted }: { stream: MediaStream | null; label: string; muted?: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [stream]);
  return (
    <div style={{ position: "relative", background: "#000", borderRadius: 12, overflow: "hidden", aspectRatio: "16/9" }}>
      <video ref={ref} autoPlay playsInline muted={muted} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <span style={{ position: "absolute", left: 8, bottom: 8, fontSize: 12, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,.5)", padding: "2px 8px", borderRadius: 6 }}>{label}</span>
    </div>
  );
}

type Tab = "notes" | "code" | "whiteboard";

export function InterviewRoom({ interviewId }: { interviewId: string }) {
  const { user } = useCurrentUser();
  const displayName = user?.name ?? "Interviewer";
  const room = useCollabRoom(interviewId, "host", displayName);
  const [tab, setTab] = useState<Tab>("notes");
  const [codeLang, setCodeLang] = useState("typescript");
  const wbRef = useRef<WhiteboardHandle | null>(null);
  // latest content mirrors for the snapshot
  const notesText = useRef("");
  const codeText = useRef("");
  const [saved, setSaved] = useState<string | null>(null);

  const save = useCallback(async () => {
    try {
      const body = {
        notesText: notesText.current,
        code: codeText.current,
        codeLanguage: codeLang,
        whiteboardImageKey: wbRef.current?.toDataURL() ?? undefined,
      };
      const res = await fetch(`${API_BASE}/interviews/${interviewId}/artifact`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json", ...(authToken() ? { Authorization: `Bearer ${authToken()}` } : {}) },
        body: JSON.stringify(body),
      });
      if (res.ok) setSaved(new Date().toLocaleTimeString());
    } catch { /* autosave is best-effort */ }
  }, [interviewId, codeLang]);

  // Autosave every 15s while live + once on unmount.
  useEffect(() => {
    if (room.status !== "live") return;
    const t = setInterval(() => void save(), 15_000);
    return () => { clearInterval(t); void save(); };
  }, [room.status, save]);

  const exportPdf = useCallback(async () => {
    await save();
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 18;
    doc.setFontSize(16); doc.text("Interview record", 14, y); y += 8;
    doc.setFontSize(10); doc.setTextColor(120); doc.text(`Interview ${interviewId} · exported ${new Date().toLocaleString()}`, 14, y); doc.setTextColor(0); y += 10;
    const section = (title: string, lines: string[]) => {
      if (y > 270) { doc.addPage(); y = 18; }
      doc.setFontSize(12); doc.setFont(undefined as any, "bold"); doc.text(title, 14, y); doc.setFont(undefined as any, "normal"); y += 6;
      doc.setFontSize(10);
      for (const line of lines) {
        for (const w of doc.splitTextToSize(line || " ", 180) as string[]) {
          if (y > 285) { doc.addPage(); y = 18; }
          doc.text(w, 14, y); y += 5;
        }
      }
      y += 4;
    };
    section("Notes", (notesText.current || "(none)").split("\n"));
    section(`Code (${codeLang})`, (codeText.current || "(none)").split("\n"));
    const img = wbRef.current?.toDataURL();
    if (img) {
      if (y > 200) { doc.addPage(); y = 18; }
      doc.setFontSize(12); doc.setFont(undefined as any, "bold"); doc.text("Whiteboard", 14, y); doc.setFont(undefined as any, "normal"); y += 6;
      try { doc.addImage(img, "PNG", 14, y, 180, 101); y += 110; } catch { /* image add failed */ }
    }
    doc.save(`interview-${interviewId}.pdf`);
  }, [interviewId, codeLang, save]);

  const ctrlBtn: React.CSSProperties = { background: "#1f2430", color: "#e6edf3", border: "1px solid #2a2f3a", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" };
  const tabBtn = (t: Tab): React.CSSProperties => ({ padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "transparent", color: tab === t ? "#fff" : "#8b93a7", borderBottom: tab === t ? "2px solid #4dd4ac" : "2px solid transparent" });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0d1117", color: "#e6edf3" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid #1f2430" }}>
        <strong style={{ fontSize: 14 }}>Interview room</strong>
        <span style={{ fontSize: 12, color: room.status === "live" ? "#4dd4ac" : "#ffd166" }}>
          {room.status === "live" ? "● Live" : room.status === "connecting" ? "Connecting…" : room.status === "denied" ? "Access denied" : room.status === "ended" ? "Ended" : "Connection issue"}
        </span>
        {saved && <span style={{ fontSize: 11, color: "#8b93a7" }}>saved {saved}</span>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button style={ctrlBtn} onClick={() => room.toggleMute()}>{room.muted ? "Unmute" : "Mute"}</button>
          <button style={ctrlBtn} onClick={() => room.toggleCamera()}>{room.cameraOff ? "Camera on" : "Camera off"}</button>
          <button style={ctrlBtn} onClick={() => void exportPdf()}>Export PDF</button>
          <button style={{ ...ctrlBtn, background: "#3a1f24", borderColor: "#5a2a2a" }} onClick={() => room.leave()}>Leave</button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "minmax(220px, 320px) 1fr" }}>
        {/* Video rail */}
        <div style={{ borderRight: "1px solid #1f2430", padding: 12, display: "flex", flexDirection: "column", gap: 10, overflow: "auto" }}>
          <VideoTile stream={room.localStream} label={`${displayName} (you)`} muted />
          {room.remoteMedia.map((m) => <VideoTile key={m.id} stream={m.stream} label={m.name} />)}
          {room.remoteMedia.length === 0 && (
            <div style={{ fontSize: 12, color: "#8b93a7", textAlign: "center", padding: 12 }}>
              Waiting for the other participant to join…
            </div>
          )}
        </div>

        {/* Collaboration surfaces */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1f2430", padding: "0 8px" }}>
            <button style={tabBtn("notes")} onClick={() => setTab("notes")}>Notes</button>
            <button style={tabBtn("code")} onClick={() => setTab("code")}>Code</button>
            <button style={tabBtn("whiteboard")} onClick={() => setTab("whiteboard")}>Whiteboard</button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            {!room.doc ? (
              <div style={{ padding: 24, color: "#8b93a7" }}>Preparing the shared workspace…</div>
            ) : (
              <>
                <div style={{ height: "100%", display: tab === "notes" ? "block" : "none" }}>
                  <CollabNotes doc={room.doc} onText={(t) => { notesText.current = t; }} />
                </div>
                <div style={{ height: "100%", display: tab === "code" ? "block" : "none" }}>
                  <CollabCode doc={room.doc} language={codeLang} onLanguageChange={setCodeLang} onText={(t) => { codeText.current = t; }} />
                </div>
                <div style={{ height: "100%", display: tab === "whiteboard" ? "block" : "none" }}>
                  <CollabWhiteboard ref={wbRef} doc={room.doc} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
