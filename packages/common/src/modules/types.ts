/**
 * Module manifest types — the canonical shape of a "module" in the ATS.
 *
 * A module is a self-contained unit of product surface: an AI agent, a
 * platform capability, or an end-user feature. The registry (registry.ts)
 * enumerates the app's REAL modules (derived from the live agent set, the
 * existing plan limits, and the cd-shell navigation) so that downstream
 * workflows (customizable dashboards, the module system, the OA platform)
 * have a single in-code source of truth for what the app can do, what each
 * module contributes to the UI/backend, and how modules depend on each other.
 *
 * This file is intentionally dependency-free (no zod, no prisma) so it can be
 * imported from any service or the frontend without pulling in a runtime.
 */

/** Billing plans, smallest to largest. Mirrors billing-service PLAN_LIMITS keys. */
export type ModulePlan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

/**
 * What kind of module this is:
 *  - "agent"      — an AI agent backed by a real LLM definition + stub
 *  - "capability" — a platform-level capability (billing, compliance, embed)
 *  - "feature"    — an end-user feature surface (interviews, offers, dashboards)
 */
export type ModuleType = "agent" | "capability" | "feature";

/** How the platform behaves when this module fails to load or is degraded. */
export type ModuleFailMode = "open" | "closed";

/** A navigation entry a module contributes to the app shell. */
export interface ModuleNavContribution {
  label: string;
  href: string;
  /** Lowercased role keys allowed to see this entry (match cd-shell ROLE_MAP). */
  roles: string[];
}

/**
 * Everything a module contributes to the running system. Every field is
 * optional: a pure-backend module may contribute only gatewayRoutes + workers,
 * while a pure-UI module contributes only nav + routes + widgets.
 */
export interface ModuleContributions {
  /** Sidebar / shell navigation entries. */
  nav?: ModuleNavContribution[];
  /** Frontend route paths the module owns (e.g. "/interviews"). */
  routes?: string[];
  /** Dashboard widget keys the module provides (consumed by later WFs). */
  widgets?: string[];
  /** Public gateway route prefixes the module exposes (e.g. "/api/sourcing"). */
  gatewayRoutes?: string[];
  /** Background worker / queue names the module runs. */
  workers?: string[];
  /** NATS subjects the module publishes or subscribes to. */
  natsSubjects?: string[];
  /** Agent type keys this module registers in the ai-engine runtime. */
  agentTypes?: string[];
}

/** A dependency on another module, by key, with a semver range it satisfies. */
export interface ModuleDependency {
  key: string;
  /** A semver range string (e.g. "^1.0.0", ">=1.2.0"). */
  range: string;
}

/**
 * The full manifest for one module. Manifests are static, in-code, and frozen
 * at build time; the registry is validated (validateRegistry) for dependency
 * integrity (no cycles, no missing deps) before it is consumed.
 */
export interface ModuleManifest {
  /** Stable unique key (kebab-case), e.g. "ai-screening". */
  key: string;
  /** Human-readable name shown in admin UIs. */
  name: string;
  /** Semver version of the module contract. */
  version: string;
  /** Grouping bucket, e.g. "hiring", "intelligence", "governance", "platform". */
  category: string;
  type: ModuleType;
  /** Minimum plan required to enable this module. Omit = available on all plans. */
  requiresPlan?: ModulePlan;
  /** Whether the module is on by default for a newly provisioned tenant. */
  defaultEnabled: boolean;
  /** Other modules this module needs (validated for cycles + presence). */
  dependencies: ModuleDependency[];
  /** Free-form capability tags this module provides (consumed by the gate layer). */
  capabilities: string[];
  /** Permission keys the module guards its surfaces with. */
  permissions: string[];
  /** What the module contributes to the running system. */
  contributions: ModuleContributions;
  /**
   * REQUIRED per-module fail posture for when the gate's source of truth
   * (billing-service) is unavailable. "open" = soft-gate (allow on a billing
   * outage); "closed" = hard-gate (deny on a billing outage so a blip cannot
   * silently grant access). Every manifest MUST declare this explicitly — the
   * resolver/gate read getModule().failMode and treat "closed" as fail-closed,
   * anything else (including a missing value) as fail-open, so leaving it off
   * would silently make a sensitive surface fail open. Making it required forces
   * an explicit, audited decision per module.
   */
  failMode: ModuleFailMode;
}
