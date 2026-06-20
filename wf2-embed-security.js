export const meta = {
  name: 'wf2-embed-security-groundwork',
  description: 'WF2: per-tenant /embed/*-scoped framing headers + EMBED_SECRET mint/verify primitives + tenant embedAllowedOrigins column. Unlocks embeddable surfaces safely; NO embed screens yet. Global anti-framing posture unchanged for all existing routes.',
  phases: [
    { title: 'Aux', detail: '3 agents: nginx, tenant schema+branding, env+compose (disjoint)' },
    { title: 'Gateway', detail: '1 agent: embed-token + embed-headers libs + app.ts wiring (owns app.ts)' },
    { title: 'Verify', detail: 'gateway+tenant tsc + backward-compat (existing routes unchanged) audit' },
  ],
}

const REPORT = {
  type: "object", additionalProperties: false,
  properties: {
    files: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    buildClean: { type: "boolean" },
    contract: { type: "string", description: "exact route/lib signatures + claim shape for downstream WFs" },
    notes: { type: "string" },
  },
  required: ["files", "summary", "buildClean", "contract", "notes"],
}

const CTX = "Repo D:/CDC/ATS — multi-tenant AI ATS gateway (Express 5, apps/api-gateway) already uses helmet() + jsonwebtoken. READ the real code first (apps/api-gateway/src/app.ts helmet setup + the existing JWT/gatewayAuth in lib/, infra/nginx.conf, apps/tenant-service branding.ts + schema.prisma, .env, docker-compose.demo.yml). HARD RULES: every change ADDITIVE and SCOPED — the global anti-framing posture (X-Frame-Options on all existing routes) must be byte-identical; only NEW /embed/* + /api/embed/* paths get relaxed headers; fail-CLOSED when no allowlist (empty => no framing). NO mock/fabricated data; no em/en dashes; no secrets committed to git (docker-compose references ${VARS} from the gitignored .env). This is WF2 of a 10-workflow enterprise build; the embed routes/SDK come in WF9 — this only lays the secure groundwork. @cdc-ats/common now exports crypto/aes-gcm (encryptConfig/decryptConfig) and the module registry (from WF1).";

phase('Aux')
log('3 aux agents: nginx, tenant schema+branding, env+compose')
const aux = (await parallel([
  () => agent(CTX + "\n\n=== SLICE B3: nginx ===\nEDIT infra/nginx.conf: today it sets a blanket X-Frame-Options (SAMEORIGIN/DENY) on all responses. Add a dedicated `location /embed/ { ... }` (and proxy as the SPA does) that does NOT emit X-Frame-Options (so the gateway/Next can emit a per-tenant CSP frame-ancestors instead), while EVERY other location keeps the existing X-Frame-Options unchanged. Add a comment that SameSite=None;Secure cookies are required only on the embed surface. Do not change any other location's headers. Report the exact location block added.", { label: 'b3:nginx', phase: 'Aux', schema: REPORT }),

  () => agent(CTX + "\n\n=== SLICE B4: tenant embedAllowedOrigins ===\nEDIT apps/tenant-service/prisma/schema.prisma: add `embedAllowedOrigins String[] @default([])` to the existing Tenant model (additive, defaulted => no backfill; the DB migration/db-push happens in WF3, NOT here). Then `npx prisma generate --schema apps/tenant-service/prisma/schema.prisma` so the generated client (this repo tracks generated/) has the field and host tsc passes. EDIT apps/tenant-service branding.ts (the self-service tenant-admin router) to accept + VALIDATE an optional embedAllowedOrigins on the branding PUT (each entry must be a valid https origin via URL parse; reject non-origins) and persist it via the existing prismaRls self-service path; add an audit row per change like the other branding fields. Build: `npm run build --workspace=@cdc-ats/tenant-service` (regen prisma first if needed). The running tenant-service is NOT rebuilt now (WF3 does that); just keep host tsc green. Report the validation rule + field.", { label: 'b4:tenant', phase: 'Aux', schema: REPORT }),

  () => agent(CTX + "\n\n=== SLICE B5: env + compose ===\nAdd two new secrets WITHOUT committing real values to git: (1) generate a strong EMBED_SECRET (>=32 random bytes, hex) and a strong ATS_CONFIG_ENC_KEY (exactly 32 bytes, hex — used by @cdc-ats/common crypto/aes-gcm) and write BOTH to the gitignored D:/CDC/ATS/.env (real values, local only). (2) EDIT docker-compose.demo.yml (TRACKED — no real secret values here): pass `EMBED_SECRET: ${EMBED_SECRET}` to the api-gateway service environment, and `ATS_CONFIG_ENC_KEY: ${ATS_CONFIG_ENC_KEY}` to the notification-service AND (where it will exist) assessment-service environments (add to notification now; note assessment-service is added in WF3). Use ${VAR} interpolation from .env, never literal secrets in the tracked compose file. Also add both keys (with placeholder/example values) to .env.example (tracked) so the contract is documented. Report exactly which services received which env var.", { label: 'b5:env', phase: 'Aux', schema: REPORT }),
])).filter(Boolean)
log('Aux done: ' + aux.length + '/3')

phase('Gateway')
log('Gateway: embed-token + embed-headers + app.ts wiring')
const gw = await agent(CTX + "\n\n=== SLICE B1+B2: gateway embed token + scoped framing headers (owns app.ts) ===\n1) B2 embed-token: NEW apps/api-gateway/src/lib/embed-token.ts — mintEmbedToken(claims) and verifyEmbedToken(token). HS256 via jsonwebtoken using a DEDICATED process.env.EMBED_SECRET (NOT the auth JWT secret), exp 10 minutes, audience 'cdc-embed'. Claims bake: tenantId, sub, role, module, resourceId, params (locked, server-resolved), and allowedOrigins string[] (the frame-ancestors for this embed; for now provided by the mint caller / tenant — read from the authed tenant context; fail-closed to [] if none). verify checks signature + exp + audience and returns the decoded claims or throws.\n2) NEW route POST /api/embed/token in app.ts: behind the existing gatewayAuth (an authed user mints an embed token for a resource they can access). Body { module, resourceId, params }. It resolves the tenant's embedAllowedOrigins (from req.user/tenant context; until the tenant column is live via WF3, accept an explicit allowedOrigins from the authed caller or fail-closed) and returns { token, expiresIn }.\n3) B1 embed-headers: NEW apps/api-gateway/src/lib/embed-headers.ts — middleware that, ONLY for paths matching /embed/* and /api/embed/*, removes X-Frame-Options and sets Content-Security-Policy: frame-ancestors <allowlist> (from the verified embed token's allowedOrigins; if none/empty => frame-ancestors 'none' = fail closed). Wire helmet so the GLOBAL frameguard (X-Frame-Options DENY/SAMEORIGIN) stays byte-identical on every NON-embed route; the embed middleware only overrides on the embed paths. Mount it before the proxy chain but scoped to embed paths.\nBuild: `npm run build --workspace=@cdc-ats/api-gateway`. In `contract` give: mint/verify signatures, the claim shape, the POST /api/embed/token request+response, and confirm existing routes' framing headers are unchanged.", { label: 'b1b2:gateway', phase: 'Gateway', schema: REPORT })
log('Gateway done: buildClean=' + (gw && gw.buildClean))

phase('Verify')
const verify = (await parallel([
  () => agent("Build verification for D:/CDC/ATS. Run verbatim and report each: cd apps/api-gateway && npx tsc --noEmit ; cd apps/tenant-service && npx tsc --noEmit ; cd packages/common && npm run build. REPORT: files=any with errors, summary=pass/fail, buildClean=all green, contract='', notes=every error verbatim.", { label: 'vf:build', phase: 'Verify', schema: REPORT }),
  () => agent(CTX + "\n\n=== AUDIT: backward-compat + fail-closed (read-only) ===\nVerify citing file:line: (1) the GLOBAL helmet/frameguard posture is UNCHANGED for all non-embed routes (existing routes still get the same X-Frame-Options); only /embed/* + /api/embed/* are relaxed. (2) embed framing FAILS CLOSED: empty allowlist => frame-ancestors 'none' (no framing), never a wildcard. (3) EMBED_SECRET is a dedicated secret distinct from the auth JWT secret; verify rejects tampered/expired tokens. (4) NO real secret values committed to docker-compose.demo.yml or any tracked file (only ${VAR} refs + .env.example placeholders); .env (gitignored) holds the real values. (5) tenant embedAllowedOrigins is additive+defaulted; branding validates origins. (6) NO embed SCREENS exist yet (that is WF9). Return REPORT: files=violations, summary=verdict, buildClean=true iff clean, contract='', notes=each issue with file:line.", { label: 'vf:audit', phase: 'Verify', schema: REPORT }),
])).filter(Boolean)

return { aux, gw, verify }
