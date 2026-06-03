// app/(dashboard)/security/page.tsx
// Exact Claude Design SecurityScreen (components/cd/SecAiScreens.tsx), wired to the
// real gateway via SecurityLive (/security/access/config posture + checklist, /audit
// risk alerts; posture score derived as the mean of the percentage stats).
import { SecurityLive } from "@/components/cd/security-live";

export default function SecurityPage() {
  return <SecurityLive />;
}
