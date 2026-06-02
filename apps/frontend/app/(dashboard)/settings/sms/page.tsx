"use client";
// app/(dashboard)/settings/sms/page.tsx, SMS notifications.
import { Panel, Field, input, Toggle, Button } from "../_parts";
export default function SmsPage() {
  return (
    <Panel title="SMS" desc="Text candidates interview reminders and status updates." action={<Button variant="primary" size="sm">Save</Button>}>
      <Field label="Sender number"><input className={input} defaultValue="+1 (512) 555-0100" /></Field>
      <Toggle label="Interview reminders" on />
      <Toggle label="Offer notifications" />
      <Toggle label="Require candidate opt-in" on />
    </Panel>
  );
}
