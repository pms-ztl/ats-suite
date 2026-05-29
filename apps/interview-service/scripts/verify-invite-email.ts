/**
 * End-to-end verification that a booking invite actually renders in Mailpit.
 *
 * Uses the REAL buildIcs + generateMeetingLink the scheduling agent emits,
 * sends through nodemailer (the same transport notification-service's mailer
 * uses) to Mailpit, then queries Mailpit's API to confirm delivery + content.
 *
 * Run:  npx tsx apps/interview-service/scripts/verify-invite-email.ts
 */
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { buildIcs, generateMeetingLink } from "../src/lib/calendar.js";

const SMTP_URL = process.env["SMTP_URL"] ?? "smtp://localhost:1025";
const MAILPIT_API = process.env["MAILPIT_API"] ?? "http://localhost:8025";

async function main() {
  const start = new Date(Date.now() + 86_400_000).toISOString();
  const end = new Date(Date.now() + 86_400_000 + 3_600_000).toISOString();
  const marker = `VERIFY-${Date.now()}`;
  const meetingUrl = generateMeetingLink(`verify:${marker}:${start}`);
  const attendees = ["candidate@example.com", "panel@cdc-ats.local"];
  const ics = buildIcs({
    uid: `${marker}@cdc-ats`,
    title: `Interview — TECHNICAL (${marker})`,
    start, end,
    organizerEmail: "recruiter@cdc-ats.local",
    attendees,
    meetingUrl,
    description: "Agentic scheduling invite verification",
  });

  // Send via the same transport mechanism as notification-service/mailer.ts.
  const transport = nodemailer.createTransport(SMTP_URL);
  const info = await transport.sendMail({
    from: "noreply@cdc-ats.local",
    to: attendees,
    subject: `Interview scheduled — TECHNICAL (${marker})`,
    text: `Your interview is scheduled.\nWhen: ${start}\nJoin: ${meetingUrl}`,
    html: `<p>Your interview is scheduled.</p><p><b>When:</b> ${start}</p><p><a href="${meetingUrl}">Join the meeting</a></p>`,
    icalEvent: { method: "REQUEST", content: ics },
    attachments: [{ filename: "invite.ics", content: ics, contentType: "text/calendar; method=REQUEST" }],
  });
  console.log(`✓ sent via ${SMTP_URL} (messageId ${info.messageId})`);

  // Confirm Mailpit received it.
  await new Promise((r) => setTimeout(r, 500));
  const list: any = await (await fetch(`${MAILPIT_API}/api/v1/messages?limit=20`)).json();
  const hit = (list.messages ?? []).find((m: any) => (m.Subject ?? "").includes(marker));
  assert.ok(hit, `message with marker ${marker} not found in Mailpit`);
  console.log(`✓ Mailpit received it — subject: "${hit.Subject}"`);
  console.log(`✓ recipients: ${(hit.To ?? []).map((t: any) => t.Address).join(", ")}`);

  // Pull the full message + confirm the meeting link + ICS attachment render.
  const full: any = await (await fetch(`${MAILPIT_API}/api/v1/message/${hit.ID}`)).json();
  const body = `${full.HTML ?? ""}${full.Text ?? ""}`;
  assert.ok(body.includes(meetingUrl), "meeting link missing from email body");
  console.log(`✓ meeting link present in body: ${meetingUrl}`);
  const atts = full.Attachments ?? [];
  const icsAtt = atts.find((a: any) => (a.FileName ?? "").endsWith(".ics") || (a.ContentType ?? "").includes("calendar"));
  assert.ok(icsAtt, "ICS calendar attachment missing");
  console.log(`✓ ICS invite attached: ${icsAtt.FileName} (${icsAtt.ContentType})`);

  console.log("\nINVITE EMAIL RENDERS IN MAILPIT ✅");
}

main().catch((err) => { console.error("\n❌ VERIFY FAILED:", err.message); process.exit(1); });
