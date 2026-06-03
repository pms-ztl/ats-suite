// app/(dashboard)/copilot/page.tsx
// Exact Claude Design Copilot (components/cd/CopilotScreen.tsx), mounted via
// CopilotLive with the design's example grounded Q&A (no copilot backend yet).
import { CopilotLive } from "@/components/cd/copilot-live";

export default function CopilotPage() {
  return <CopilotLive />;
}
