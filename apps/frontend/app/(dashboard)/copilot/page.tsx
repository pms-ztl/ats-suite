// app/(dashboard)/copilot/page.tsx
// Claude Design Copilot (components/cd/CopilotScreen.tsx), mounted via CopilotLive
// which sends each question to the REAL /api/copilot agent and renders the
// grounded answer + cited sources (or an honest error).
import { CopilotLive } from "@/components/cd/copilot-live";

export default function CopilotPage() {
  return <CopilotLive />;
}
