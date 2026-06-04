/**
 * Per-request tenant context (async-local) for Postgres Row-Level Security.
 *
 * The RLS Prisma extension (in each service's lib/prisma.ts) reads the current
 * tenant id from here and stamps it onto the DB session (set_config
 * 'app.current_tenant_id') so policies only expose that tenant's rows. The HTTP
 * middleware binds it from the gateway-forwarded X-Tenant-Id header; workers /
 * subscribers that act for a known tenant can use runWithTenant().
 */
import { AsyncLocalStorage } from "node:async_hooks";
import type { RequestHandler } from "express";

const store = new AsyncLocalStorage<string>();

/** The tenant id bound to the current async context, if any. */
export function getCurrentTenantId(): string | undefined {
  return store.getStore();
}

/** Run `fn` with `tenantId` as the ambient context (for non-HTTP callers). */
export function runWithTenant<T>(tenantId: string, fn: () => T): T {
  return store.run(tenantId, fn);
}

/**
 * Express middleware — binds the request's tenant to the async-local store.
 * Mount it after the body parser; the gateway has already validated the JWT and
 * forwarded X-Tenant-Id (and readAuthHeaders rejects requests without it).
 */
export const tenantContext: RequestHandler = (req, _res, next) => {
  const tid = req.headers["x-tenant-id"];
  if (typeof tid === "string" && tid) store.run(tid, () => next());
  else next();
};
