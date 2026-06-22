"use client";
// Module D — interview room route. The room is browser-only (WebRTC, Monaco,
// Yjs), so it is dynamically imported with SSR disabled.
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const InterviewRoom = dynamic(
  () => import("@/components/cd/interview-room/InterviewRoom").then((m) => m.InterviewRoom),
  { ssr: false, loading: () => <div style={{ padding: 24, color: "#8b93a7" }}>Loading interview room…</div> },
);

export default function InterviewRoomPage() {
  const params = useParams();
  const id = String(params?.["id"] ?? "");
  if (!id) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <InterviewRoom interviewId={id} />
    </div>
  );
}
