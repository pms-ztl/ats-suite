// app/(dashboard)/admin/platform/prompts/page.tsx
// Exact Claude Design PromptsScreen (components/cd/PlatformScreens.tsx), mounted
// via PromptsLive. Super-admin-gated by admin/layout.tsx.
import { PromptsLive } from "@/components/cd/platform-live";

export default function PlatformPromptsPage() {
  return <PromptsLive />;
}
