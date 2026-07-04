#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Demo bootstrap. Three idempotent phases, safe to run on every `up`:
#
#   1. Seed demo data through the gateway API (apps/seed-data) - skips a tenant
#      that already exists (login probe), so re-runs do not duplicate data.
#   2. Plan: upgrade the PAYING demo tenants to ENTERPRISE so plan-gated AI is
#      unlocked, while DELIBERATELY leaving "Northwind Staffing" on FREE as the
#      gating control (so a reviewer can still see modules 402/404 for an
#      unentitled tenant).
#   3. Entitlements (WF10 / J4): turn the new platform modules ON for the canonical
#      demo tenant "Pinnacle Tech" via REAL rows - billing TenantModule overrides,
#      an identity DashboardLayout tenant-default, and the tenant theme columns +
#      embed origin. No code hacks: the gateway/worker module resolver reads these
#      exact rows. Every write is an UPSERT keyed on a natural unique, so the step
#      is fully re-runnable.
#
# Reads API_URL, TENANT_DATABASE_URL, BILLING_DATABASE_URL, IDENTITY_DATABASE_URL.
# (psql connects as the `postgres` superuser, which bypasses FORCE RLS, so these
# direct inserts land regardless of the per-tenant RLS policies.)
# -----------------------------------------------------------------------------
set -u
cd /repo

# The canonical demo tenant that gets the new modules turned on, and the FREE
# gating-control tenant that is intentionally NOT upgraded. Matched by Tenant.name
# (the seeder slug carries a non-deterministic timestamp suffix, so name is the
# stable key). Keep these byte-equal to the orgName values in apps/seed-data/src/seed.ts.
DEMO_TENANT_NAME="Pinnacle Tech"
FREE_TENANT_NAME="Northwind Staffing"
# NCR Voyix - the client-branded demo tenant (apps/seed-data). It is ENTERPRISE
# (Phase 2 upgrades every non-FREE-control tenant), and gets the online-assessment
# module turned ON here so the HackerRank + HackerEarth integration cards render on
# Settings -> Integrations and the /assessments surface is reachable. The cards
# stay honestly INERT ("Not connected") until NCR pastes its own vendor keys - this
# only flips the module gate, it stores NO credentials and fabricates nothing.
NCR_TENANT_NAME="NCR Voyix"

# The demo origin authorized to frame the white-label embed. Single bare https
# origin (scheme+host[:port], no path) - same shape branding.ts validates.
DEMO_EMBED_ORIGIN="https://demo.cdc-ats.com"

echo "==> Waiting for the gateway..."
for i in $(seq 1 80); do
  if curl -fsS "http://api-gateway:4000/healthz" >/dev/null 2>&1; then echo "    gateway is up"; break; fi
  sleep 3
done
# let downstream services finish booting after the gateway answers
sleep 10

# -- Phase 1 - demo data ------------------------------------------------------
echo "==> Seeding demo data (idempotent)..."
API_URL="${API_URL:-http://api-gateway:4000/api}" npx tsx apps/seed-data/src/seed.ts \
  || echo "    !! seed reported errors (continuing)"

# -- Phase 2 - plans (paying tenants -> ENTERPRISE; FREE control stays FREE) --
# NOTE the WHERE clause: every demo tenant EXCEPT the FREE control is upgraded.
# This replaces the old blanket "UPDATE ... SET plan='ENTERPRISE'" (which upgraded
# everything and left no FREE tenant to prove gating). Idempotent: an already-
# ENTERPRISE row is set to the same value.
echo "==> Unlocking AI: paying demo tenants -> ENTERPRISE (FREE control kept on FREE)..."
psql "$TENANT_DATABASE_URL" -v ON_ERROR_STOP=0 \
  -c "UPDATE \"Tenant\" SET plan='ENTERPRISE' WHERE name <> '${FREE_TENANT_NAME}';" \
  -c "UPDATE \"Tenant\" SET plan='FREE' WHERE name = '${FREE_TENANT_NAME}';" \
  || echo "    !! tenant plan upgrade skipped"

# billing TenantPlanCache mirrors Tenant.plan and is what the module/agent gates
# read. Upgrade the paying tenants' cache rows by id (resolved from tenant_db by
# name) and force the FREE control's cache row to FREE. We resolve ids rather than
# blanket-updating so the FREE control's cache is never accidentally upgraded.
PAYING_IDS=$(psql "$TENANT_DATABASE_URL" -tAc \
  "SELECT id FROM \"Tenant\" WHERE name <> '${FREE_TENANT_NAME}';" 2>/dev/null | tr '\n' ' ')
FREE_ID=$(psql "$TENANT_DATABASE_URL" -tAc \
  "SELECT id FROM \"Tenant\" WHERE name = '${FREE_TENANT_NAME}' LIMIT 1;" 2>/dev/null | tr -d '[:space:]')

if [ -n "${PAYING_IDS// /}" ]; then
  for tid in $PAYING_IDS; do
    psql "$BILLING_DATABASE_URL" -v ON_ERROR_STOP=0 -c \
      "INSERT INTO \"TenantPlanCache\" (\"tenantId\", plan, \"updatedAt\")
       VALUES ('$tid', 'ENTERPRISE', now())
       ON CONFLICT (\"tenantId\") DO UPDATE SET plan='ENTERPRISE', \"updatedAt\"=now();" \
      >/dev/null 2>&1 || echo "    !! billing plan cache upgrade skipped for $tid"
  done
  echo "    ENTERPRISE plan cache set for paying tenants"
fi
if [ -n "$FREE_ID" ]; then
  psql "$BILLING_DATABASE_URL" -v ON_ERROR_STOP=0 -c \
    "INSERT INTO \"TenantPlanCache\" (\"tenantId\", plan, \"updatedAt\")
     VALUES ('$FREE_ID', 'FREE', now())
     ON CONFLICT (\"tenantId\") DO UPDATE SET plan='FREE', \"updatedAt\"=now();" \
    >/dev/null 2>&1 || echo "    !! billing plan cache (FREE control) skipped"
  echo "    FREE plan cache kept for the gating-control tenant"
fi

# -- Phase 3 - entitlements for the canonical demo tenant (Pinnacle) ----------
# Resolve Pinnacle's tenant id once (by name). Everything below keys off it.
DEMO_ID=$(psql "$TENANT_DATABASE_URL" -tAc \
  "SELECT id FROM \"Tenant\" WHERE name = '${DEMO_TENANT_NAME}' LIMIT 1;" 2>/dev/null | tr -d '[:space:]')

if [ -z "$DEMO_ID" ]; then
  echo "    !! demo tenant '${DEMO_TENANT_NAME}' not found - skipping entitlement seed"
else
  echo "==> Entitling demo tenant '${DEMO_TENANT_NAME}' ($DEMO_ID) with the new modules..."

  # Resolve an actor (the tenant admin) for the audit columns (updatedBy). Falls
  # back to a literal so the inserts never fail on a null NOT-NULL column.
  ADMIN_ID=$(psql "$IDENTITY_DATABASE_URL" -tAc \
    "SELECT id FROM \"User\" WHERE \"tenantId\" = '$DEMO_ID' AND role = 'ADMIN' ORDER BY \"createdAt\" ASC LIMIT 1;" \
    2>/dev/null | tr -d '[:space:]')
  ADMIN_ID="${ADMIN_ID:-seed-script}"

  # 3a - billing TenantModule overrides. One UPSERT per module key. enabled=true
  # is what the WF4 resolver reads as the per-tenant override (Gate 3); the plan
  # gate (Gate 2) already passes because Pinnacle is ENTERPRISE. These three keys
  # are the new platform modules (registry: defaultEnabled=false), so without these
  # rows they resolve OFF - turning them on here is REAL entitlement, not a hack.
  #   oa-assessments       PROFESSIONAL+  (Online Assessments + oa-grader)
  #   custom-dashboards    PROFESSIONAL+  (the customizable dashboard surface)
  #   white-label-embed    ENTERPRISE     (iframe embed; depends on custom-dashboards)
  for mkey in oa-assessments custom-dashboards white-label-embed; do
    psql "$BILLING_DATABASE_URL" -v ON_ERROR_STOP=0 -c \
      "INSERT INTO \"TenantModule\"
         (id, \"tenantId\", \"moduleKey\", enabled, config, \"enabledAt\", \"updatedBy\", \"createdAt\", \"updatedAt\")
       VALUES
         (gen_random_uuid(), '$DEMO_ID', '$mkey', true, '{}'::jsonb, now(), '$ADMIN_ID', now(), now())
       ON CONFLICT (\"tenantId\", \"moduleKey\") DO UPDATE
         SET enabled = true,
             \"enabledAt\" = COALESCE(\"TenantModule\".\"enabledAt\", now()),
             \"updatedBy\" = EXCLUDED.\"updatedBy\",
             \"updatedAt\" = now();" \
      >/dev/null 2>&1 \
      && echo "    module ON: $mkey" \
      || echo "    !! module upsert skipped: $mkey"
  done

  # 3b - tenant theme + embed allowlist (Tenant columns added in WF3). All three
  # are additive, defaulted columns, so this only OVERRIDES the demo tenant's
  # defaults; idempotent because it is a plain UPDATE to fixed values.
  #   dashboardThemeTokens  a small, real flat token map (renderer applies these
  #                         as CSS custom properties; values are plain strings).
  #   defaultColorMode      'dark' so the demo lands on the polished dark chrome.
  #   embedAllowedOrigins   the single demo origin authorized to frame the embed
  #                         (fail-closed elsewhere: every other tenant stays []).
  psql "$TENANT_DATABASE_URL" -v ON_ERROR_STOP=0 -c \
    "UPDATE \"Tenant\" SET
       \"dashboardThemeTokens\" = '{\"brand-accent\":\"#6E56CF\",\"brand-accent-fg\":\"#ffffff\",\"radius-card\":\"16px\"}'::jsonb,
       \"defaultColorMode\" = 'dark',
       \"embedAllowedOrigins\" = ARRAY['${DEMO_EMBED_ORIGIN}']::text[]
     WHERE id = '$DEMO_ID';" \
    >/dev/null 2>&1 \
    && echo "    theme + embed origin set ($DEMO_EMBED_ORIGIN)" \
    || echo "    !! theme/embed update skipped"

  # 3c - identity DashboardLayout tenant-default (userId = NULL). This is the row
  # the WF6 read hook resolves to when a user has no personal override; it is a
  # VALID DashboardDocument (validated against @cdc-ats/contracts before being
  # embedded here) that includes the module-gated `oa_results` widget, so the
  # demo's home shows the assessment results tile now that oa-assessments is ON.
  # Idempotent: delete any prior tenant-default for the 'home' key, then insert
  # one fresh row (a clean replace; the [tenantId,userId,dashboardKey] unique has
  # a NULL userId member so a plain ON CONFLICT is awkward - delete+insert is the
  # robust re-runnable form). The document below is byte-equal to the one produced
  # by the WF5 defaults builder for the ADMIN board plus the oa_results tile.
  DASHBOARD_DOC='{"schemaVersion":1,"globalFilters":{},"widgets":[{"instanceId":"admin_kpis","type":"kpi_scorecard","title":"Overview","dataSourceKey":"dashboard_kpis","viz":"KpiCard","config":{"maxTiles":4},"minW":3,"minH":3},{"instanceId":"admin_funnel","type":"pipeline_funnel","title":"Hiring funnel","dataSourceKey":"pipeline_funnel","viz":"FlowRibbon","config":{},"minW":4,"minH":4},{"instanceId":"admin_verdicts","type":"breakdown","title":"Screening verdict mix","dataSourceKey":"screening_list","viz":"WaffleField","config":{},"minW":3,"minH":4},{"instanceId":"admin_spend","type":"time_series","title":"AI spend by provider","dataSourceKey":"spend_trend","viz":"StreamGraph","config":{},"minW":3,"minH":4},{"instanceId":"admin_oversight","type":"oversight_gauge","title":"Human oversight","dataSourceKey":"oversight","viz":"BeadStream","config":{},"minW":3,"minH":4},{"instanceId":"admin_agents","type":"billing_spend","title":"Per-agent runs & spend","dataSourceKey":"billing_usage","viz":"BarsChart","config":{"days":30},"minW":3,"minH":4},{"instanceId":"admin_pending","type":"list_feed","title":"Pending actions","dataSourceKey":"review_queue","viz":"PendingList","config":{"limit":10},"minW":3,"minH":4},{"instanceId":"admin_oa","type":"oa_results","title":"Assessment results","dataSourceKey":"assessment_results","viz":"BarsChart","config":{"maxBars":8},"minW":3,"minH":4},{"instanceId":"admin_candidates","type":"table","title":"Recent candidates","dataSourceKey":"candidates_list","viz":"DataTable","config":{"pageSize":8},"minW":4,"minH":4}],"layouts":{"lg":[{"i":"admin_kpis","x":0,"y":0,"w":12,"h":4},{"i":"admin_funnel","x":0,"y":4,"w":8,"h":5},{"i":"admin_verdicts","x":8,"y":4,"w":4,"h":5},{"i":"admin_spend","x":0,"y":9,"w":6,"h":5},{"i":"admin_oversight","x":6,"y":9,"w":6,"h":5},{"i":"admin_agents","x":0,"y":14,"w":6,"h":5},{"i":"admin_pending","x":6,"y":14,"w":6,"h":5},{"i":"admin_oa","x":0,"y":19,"w":6,"h":5},{"i":"admin_candidates","x":6,"y":19,"w":6,"h":6}],"md":[{"i":"admin_kpis","x":0,"y":0,"w":10,"h":4},{"i":"admin_funnel","x":0,"y":4,"w":7,"h":5},{"i":"admin_verdicts","x":7,"y":4,"w":3,"h":5},{"i":"admin_spend","x":0,"y":9,"w":5,"h":5},{"i":"admin_oversight","x":5,"y":9,"w":5,"h":5},{"i":"admin_agents","x":0,"y":14,"w":5,"h":5},{"i":"admin_pending","x":5,"y":14,"w":5,"h":5},{"i":"admin_oa","x":0,"y":19,"w":5,"h":5},{"i":"admin_candidates","x":5,"y":19,"w":5,"h":6}],"sm":[{"i":"admin_kpis","x":0,"y":0,"w":6,"h":4},{"i":"admin_funnel","x":0,"y":4,"w":6,"h":5},{"i":"admin_verdicts","x":0,"y":9,"w":6,"h":5},{"i":"admin_spend","x":0,"y":14,"w":6,"h":5},{"i":"admin_oversight","x":0,"y":19,"w":6,"h":5},{"i":"admin_agents","x":0,"y":24,"w":6,"h":5},{"i":"admin_pending","x":0,"y":29,"w":6,"h":5},{"i":"admin_oa","x":0,"y":34,"w":6,"h":5},{"i":"admin_candidates","x":0,"y":39,"w":6,"h":6}],"xs":[{"i":"admin_kpis","x":0,"y":0,"w":4,"h":4},{"i":"admin_funnel","x":0,"y":4,"w":4,"h":5},{"i":"admin_verdicts","x":0,"y":9,"w":4,"h":5},{"i":"admin_spend","x":0,"y":14,"w":4,"h":5},{"i":"admin_oversight","x":0,"y":19,"w":4,"h":5},{"i":"admin_agents","x":0,"y":24,"w":4,"h":5},{"i":"admin_pending","x":0,"y":29,"w":4,"h":5},{"i":"admin_oa","x":0,"y":34,"w":4,"h":5},{"i":"admin_candidates","x":0,"y":39,"w":4,"h":6}],"xxs":[{"i":"admin_kpis","x":0,"y":0,"w":2,"h":4},{"i":"admin_funnel","x":0,"y":4,"w":2,"h":5},{"i":"admin_verdicts","x":0,"y":9,"w":2,"h":5},{"i":"admin_spend","x":0,"y":14,"w":2,"h":5},{"i":"admin_oversight","x":0,"y":19,"w":2,"h":5},{"i":"admin_agents","x":0,"y":24,"w":2,"h":5},{"i":"admin_pending","x":0,"y":29,"w":2,"h":5},{"i":"admin_oa","x":0,"y":34,"w":2,"h":5},{"i":"admin_candidates","x":0,"y":39,"w":2,"h":6}]}}'

  # Pass the JSON via a psql variable so quoting is safe (no single quotes in the
  # document). :'doc' interpolates it as a quoted literal; we cast to jsonb.
  psql "$IDENTITY_DATABASE_URL" -v ON_ERROR_STOP=0 -v doc="$DASHBOARD_DOC" -c \
    "DELETE FROM \"DashboardLayout\" WHERE \"tenantId\" = '$DEMO_ID' AND \"userId\" IS NULL AND \"dashboardKey\" = 'home';
     INSERT INTO \"DashboardLayout\"
       (id, \"tenantId\", \"userId\", scope, \"dashboardKey\", name, document, \"schemaVersion\", \"isDefault\", \"updatedBy\", \"createdAt\", \"updatedAt\")
     VALUES
       (gen_random_uuid(), '$DEMO_ID', NULL, 'tenant_default', 'home', 'Pinnacle command center', :'doc'::jsonb, 1, true, '$ADMIN_ID', now(), now());" \
    >/dev/null 2>&1 \
    && echo "    tenant-default dashboard 'home' set (includes oa_results tile)" \
    || echo "    !! dashboard layout upsert skipped"
fi

# -- Phase 3b - NCR Voyix online-assessment entitlement ------------------------
# Turn ON the oa-assessments module for the client-branded NCR Voyix tenant so the
# HackerRank + HackerEarth integration cards render (Settings -> Integrations) and
# the /assessments surface is reachable through the gateway's requireModule gate.
# This ONLY flips the module override (Gate 3); the plan gate already passes (NCR
# Voyix is ENTERPRISE via Phase 2). It stores NO credentials - the vendor cards
# stay "Not connected" until NCR pastes its own keys. custom-dashboards is also
# enabled so NCR gets the customizable dashboard surface; white-label-embed is
# intentionally left OFF (no embed origin configured for this tenant). Idempotent
# UPSERT keyed on (tenantId, moduleKey), safe to re-run.
NCR_ID=$(psql "$TENANT_DATABASE_URL" -tAc \
  "SELECT id FROM \"Tenant\" WHERE name = '${NCR_TENANT_NAME}' LIMIT 1;" 2>/dev/null | tr -d '[:space:]')

if [ -z "$NCR_ID" ]; then
  echo "    (NCR Voyix tenant not present - skipping OA entitlement; run the seeder first)"
else
  echo "==> Entitling '${NCR_TENANT_NAME}' ($NCR_ID) with oa-assessments + custom-dashboards..."
  NCR_ADMIN_ID=$(psql "$IDENTITY_DATABASE_URL" -tAc \
    "SELECT id FROM \"User\" WHERE \"tenantId\" = '$NCR_ID' AND role = 'ADMIN' ORDER BY \"createdAt\" ASC LIMIT 1;" \
    2>/dev/null | tr -d '[:space:]')
  NCR_ADMIN_ID="${NCR_ADMIN_ID:-seed-script}"
  for mkey in oa-assessments custom-dashboards; do
    psql "$BILLING_DATABASE_URL" -v ON_ERROR_STOP=0 -c \
      "INSERT INTO \"TenantModule\"
         (id, \"tenantId\", \"moduleKey\", enabled, config, \"enabledAt\", \"updatedBy\", \"createdAt\", \"updatedAt\")
       VALUES
         (gen_random_uuid(), '$NCR_ID', '$mkey', true, '{}'::jsonb, now(), '$NCR_ADMIN_ID', now(), now())
       ON CONFLICT (\"tenantId\", \"moduleKey\") DO UPDATE
         SET enabled = true,
             \"enabledAt\" = COALESCE(\"TenantModule\".\"enabledAt\", now()),
             \"updatedBy\" = EXCLUDED.\"updatedBy\",
             \"updatedAt\" = now();" \
      >/dev/null 2>&1 \
      && echo "    module ON: $mkey" \
      || echo "    !! module upsert skipped: $mkey"
  done
fi

echo "==> Seed complete. The demo is ready."
