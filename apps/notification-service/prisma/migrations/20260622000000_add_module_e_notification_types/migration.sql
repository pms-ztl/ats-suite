-- Module E — new NotificationType enum values for the hire / offer / reject
-- candidate comms. ADD VALUE IF NOT EXISTS is idempotent + non-blocking.
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'OFFER_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'APPLICATION_HIRED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'APPLICATION_REJECTED';
