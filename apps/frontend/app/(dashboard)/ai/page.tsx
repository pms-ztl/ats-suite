// app/(dashboard)/ai/page.tsx
// Exact Claude Design AiOpsScreen (components/cd/SecAiScreens.tsx) - the AI
// Operations agent-fleet view, mounted via AiOpsLive. The gateway exposes no
// agent-fleet telemetry endpoint, so the KPIs + fleet table are the design's
// example content using our real agent names.
import { AiOpsLive } from "@/components/cd/ai-ops-live";

export default function AiOperationsPage() {
  return <AiOpsLive />;
}
