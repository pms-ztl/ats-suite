import { PrismaClient } from '../../node_modules/.prisma/client/client';

/**
 * Sets the PostgreSQL session variable `app.tenant_id` so that
 * Row Level Security (RLS) policies filter rows to the given tenant.
 *
 * MUST be called inside a transaction or at the start of a request
 * so that `SET LOCAL` scopes the variable to the current transaction.
 *
 * @param prisma - The PrismaClient instance
 * @param tenantId - The authenticated tenant's ID
 */
export async function setTenantContext(
  prisma: PrismaClient,
  tenantId: string,
): Promise<void> {
  // Sanitize tenantId to prevent SQL injection (only allow UUID-like chars)
  const sanitized = tenantId.replace(/[^a-zA-Z0-9\-]/g, '');
  if (sanitized !== tenantId) {
    throw new Error('Invalid tenantId format');
  }
  await prisma.$executeRawUnsafe(
    `SET LOCAL app.tenant_id = '${sanitized}'`,
  );
}

/**
 * Clears the tenant context. Use for admin / migration operations
 * where RLS should not filter rows.
 *
 * @param prisma - The PrismaClient instance
 */
export async function clearTenantContext(
  prisma: PrismaClient,
): Promise<void> {
  await prisma.$executeRawUnsafe(`RESET app.tenant_id`);
}
