-- Phase 25 — production Postgres bootstrap with per-service users + grants.
--
-- Replaces the dev `postgres-init.sql` (which used the superuser account
-- everywhere) with one role per service that only has access to its own DB.
-- Mounted into the Postgres container at /docker-entrypoint-initdb.d/ in
-- production so it runs on first boot.
--
-- Passwords here are placeholders — set them via env in your secrets
-- manager / docker secrets and edit this file (or use psql -v) before
-- the very first boot. Once Postgres has initialized, changing this file
-- has no effect; you must ALTER USER manually.
--
-- Why per-service users: blast radius. If the resume-service is ever
-- compromised, the attacker only gets the resume_db, not every tenant's
-- candidate PII.

-- ─── Databases ────────────────────────────────────────────────────────────
CREATE DATABASE identity_db;
CREATE DATABASE tenant_db;
CREATE DATABASE billing_db;
CREATE DATABASE job_db;
CREATE DATABASE candidate_db;
CREATE DATABASE interview_db;
CREATE DATABASE resume_db;
CREATE DATABASE screening_db;
CREATE DATABASE notification_db;
CREATE DATABASE onboarding_db;

-- ─── Per-service roles ────────────────────────────────────────────────────
-- Each service connects with its own role; NOLOGIN-by-default + ALTER ROLE
-- in your secrets-mgmt step would be even stricter, but Compose env files
-- need a plain connect string so a CREATEDB-less LOGIN role is the right
-- balance.

CREATE ROLE identity_user      LOGIN PASSWORD 'CHANGE_ME_identity';
CREATE ROLE tenant_user        LOGIN PASSWORD 'CHANGE_ME_tenant';
CREATE ROLE billing_user       LOGIN PASSWORD 'CHANGE_ME_billing';
CREATE ROLE job_user           LOGIN PASSWORD 'CHANGE_ME_job';
CREATE ROLE candidate_user     LOGIN PASSWORD 'CHANGE_ME_candidate';
CREATE ROLE interview_user     LOGIN PASSWORD 'CHANGE_ME_interview';
CREATE ROLE resume_user        LOGIN PASSWORD 'CHANGE_ME_resume';
CREATE ROLE screening_user     LOGIN PASSWORD 'CHANGE_ME_screening';
CREATE ROLE notification_user  LOGIN PASSWORD 'CHANGE_ME_notification';
CREATE ROLE onboarding_user    LOGIN PASSWORD 'CHANGE_ME_onboarding';

-- ─── Grant each role its own DB ───────────────────────────────────────────
GRANT ALL PRIVILEGES ON DATABASE identity_db      TO identity_user;
GRANT ALL PRIVILEGES ON DATABASE tenant_db        TO tenant_user;
GRANT ALL PRIVILEGES ON DATABASE billing_db       TO billing_user;
GRANT ALL PRIVILEGES ON DATABASE job_db           TO job_user;
GRANT ALL PRIVILEGES ON DATABASE candidate_db     TO candidate_user;
GRANT ALL PRIVILEGES ON DATABASE interview_db     TO interview_user;
GRANT ALL PRIVILEGES ON DATABASE resume_db        TO resume_user;
GRANT ALL PRIVILEGES ON DATABASE screening_db     TO screening_user;
GRANT ALL PRIVILEGES ON DATABASE notification_db  TO notification_user;
GRANT ALL PRIVILEGES ON DATABASE onboarding_db    TO onboarding_user;

-- ─── Set public schema owner per DB ───────────────────────────────────────
-- Required so the service's role can run prisma migrate against its DB.
-- Without this, Prisma can't CREATE TABLE in the public schema.

\c identity_db
ALTER SCHEMA public OWNER TO identity_user;
GRANT ALL ON SCHEMA public TO identity_user;

\c tenant_db
ALTER SCHEMA public OWNER TO tenant_user;
GRANT ALL ON SCHEMA public TO tenant_user;

\c billing_db
ALTER SCHEMA public OWNER TO billing_user;
GRANT ALL ON SCHEMA public TO billing_user;

\c job_db
ALTER SCHEMA public OWNER TO job_user;
GRANT ALL ON SCHEMA public TO job_user;

\c candidate_db
ALTER SCHEMA public OWNER TO candidate_user;
GRANT ALL ON SCHEMA public TO candidate_user;

\c interview_db
ALTER SCHEMA public OWNER TO interview_user;
GRANT ALL ON SCHEMA public TO interview_user;

\c resume_db
ALTER SCHEMA public OWNER TO resume_user;
GRANT ALL ON SCHEMA public TO resume_user;

\c screening_db
ALTER SCHEMA public OWNER TO screening_user;
GRANT ALL ON SCHEMA public TO screening_user;

\c notification_db
ALTER SCHEMA public OWNER TO notification_user;
GRANT ALL ON SCHEMA public TO notification_user;

\c onboarding_db
ALTER SCHEMA public OWNER TO onboarding_user;
GRANT ALL ON SCHEMA public TO onboarding_user;
