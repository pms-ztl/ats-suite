import { redirect } from "next/navigation";

// The old generic self-serve signup wizard is retired. The Claude Design
// "get started" / lead-capture experience is Contact.html (ported verbatim to
// /contact). Every "Start free" / "Get started" / "Choose plan" CTA points at
// /get-started, so redirecting here routes the whole funnel to that design,
// including anyone who navigates to /get-started directly.
export default function GetStartedPage() {
  redirect("/contact");
}
