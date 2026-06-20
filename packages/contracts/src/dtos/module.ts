import { z } from "zod";

// Module system contracts. ModuleManifest mirrors the canonical in-code
// manifest shape (packages/common/src/modules/types.ts) as a runtime-validated
// DTO so manifests can cross the wire / be persisted. TenantModule is a
// tenant's per-module enablement + config record.

export const ModuleTypeSchema = z.enum([
  "agent", "capability", "feature",
]);
export type ModuleType = z.infer<typeof ModuleTypeSchema>;

export const ModulePlanSchema = z.enum([
  "FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE",
]);
export type ModulePlan = z.infer<typeof ModulePlanSchema>;

export const ModuleFailModeSchema = z.enum(["open", "closed"]);
export type ModuleFailMode = z.infer<typeof ModuleFailModeSchema>;

export const ModuleDependencySchema = z.object({
  key: z.string().min(1),
  range: z.string().min(1),
});
export type ModuleDependency = z.infer<typeof ModuleDependencySchema>;

export const ModuleNavContributionSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  roles: z.array(z.string()),
});
export type ModuleNavContribution = z.infer<typeof ModuleNavContributionSchema>;

export const ModuleContributionsSchema = z.object({
  nav: z.array(ModuleNavContributionSchema).optional(),
  routes: z.array(z.string()).optional(),
  widgets: z.array(z.string()).optional(),
  gatewayRoutes: z.array(z.string()).optional(),
  workers: z.array(z.string()).optional(),
  natsSubjects: z.array(z.string()).optional(),
  agentTypes: z.array(z.string()).optional(),
});
export type ModuleContributions = z.infer<typeof ModuleContributionsSchema>;

export const ModuleManifestSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  category: z.string().min(1),
  type: ModuleTypeSchema,
  requiresPlan: ModulePlanSchema.optional(),
  defaultEnabled: z.boolean(),
  dependencies: z.array(ModuleDependencySchema),
  capabilities: z.array(z.string()),
  permissions: z.array(z.string()),
  contributions: ModuleContributionsSchema,
  // REQUIRED: every manifest must declare its billing-outage fail posture
  // explicitly. Mirrors @cdc-ats/common ModuleManifest.failMode (also required).
  failMode: ModuleFailModeSchema,
});
export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;

// A tenant's enablement state for one module. config is encrypted-at-rest
// upstream; over the wire it is an opaque object.
export const TenantModuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  moduleKey: z.string().min(1),
  enabled: z.boolean(),
  // Pinned manifest version this tenant is running, when pinned.
  version: z.string().nullable(),
  config: z.record(z.string(), z.unknown()).nullable(),
  enabledAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});
export type TenantModule = z.infer<typeof TenantModuleSchema>;
