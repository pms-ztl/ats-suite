"use client";
// app/(dashboard)/settings/sso/page.tsx, SSO / SAML & OIDC.
import { Panel, Field, input, Toggle, Button } from "../_parts";

export default function SsoSettingsPage() {
  return (
    <>
      <Panel title="Single sign-on" desc="Enterprise SSO by email domain. SAML 2.0 and OIDC supported." action={<Button variant="primary" size="sm">Save</Button>}>
        <Toggle label="Require SSO for this domain" on />
        <Field label="Protocol"><select className={input}><option>SAML 2.0</option><option>OIDC</option></select></Field>
        <Field label="Identity provider metadata URL" hint="Paste the IdP metadata URL or upload the XML."><input className={input} placeholder="https://idp.example.com/metadata" /></Field>
        <Field label="ACS / reply URL" hint="Give this to your identity provider."><input className={input} readOnly defaultValue="https://app.talentflow.com/sso/callback" /></Field>
      </Panel>
      <Panel title="SCIM provisioning" desc="Automatically sync members from your IdP.">
        <Toggle label="Enable SCIM" />
      </Panel>
    </>
  );
}
