"use client";
// Module I — field-level visibility. Reads the tenant's authored policy from the
// resolved UiConfig (config.visibility.rules) and the signed-in user's role, and
// answers canSee(field). Fail-open: an unauthored field/role is visible (today's
// behavior); only an explicit `false` hides it. SUPER_ADMIN always sees all (the
// canSeeField resolver enforces that). Frontend enforcement of the visible UX;
// server-side stripping is a separate hardening step.
import { useMemo } from "react";
import { canSeeField, type VisibilityField } from "@cdc-ats/contracts";
import { useUiConfig } from "@/lib/config/ui-config-provider";
import { useCurrentUser } from "@/hooks/use-current-user";

export function useFieldVisibility() {
  const { config } = useUiConfig();
  const { user } = useCurrentUser();
  const rules = config?.visibility?.rules;
  const role = String(user?.role ?? "").toUpperCase();
  return useMemo(
    () => ({
      canSee: (field: VisibilityField) => canSeeField(rules as any, field, role),
      role,
    }),
    [rules, role],
  );
}
