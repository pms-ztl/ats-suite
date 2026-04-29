import type { Metadata } from "next";

export const metadata: Metadata = { title: "Requisitions" };

export default function RequisitionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
