import { CandidateLayout } from "@/components/layouts/candidate-layout";

export const metadata = {
  title: "Career Portal | CDC ATS",
  description: "Browse open positions and track your applications",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // No auth required - the candidate portal is public.
  // Individual pages that need auth (e.g. status lookup) handle it themselves.
  return <CandidateLayout>{children}</CandidateLayout>;
}
