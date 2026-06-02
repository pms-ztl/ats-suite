"use client";
// app/(dashboard)/settings/security/page.tsx, Security & 2FA.
import { Panel, Field, input, Toggle, Button } from "../_parts";

export default function SecuritySettingsPage() {
  return (
    <>
      <Panel title="Two-factor authentication" desc="Require a second factor for everyone in this workspace." action={<Button variant="primary" size="sm">Save</Button>}>
        <Toggle label="Require 2FA for all members" on />
        <Toggle label="Allow authenticator apps (TOTP)" on />
        <Toggle label="Allow SMS codes" />
        <Toggle label="Allow hardware security keys" on />
      </Panel>
      <Panel title="Session policy">
        <Field label="Idle timeout"><select className={input}><option>30 minutes</option><option>1 hour</option><option>8 hours</option></select></Field>
        <Toggle label="Sign out all devices on password change" on />
      </Panel>
    </>
  );
}
