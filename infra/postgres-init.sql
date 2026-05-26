-- Create one database per service (DB-per-service architecture).
-- Run once at first `docker compose up`.
CREATE DATABASE identity_db;
CREATE DATABASE tenant_db;
CREATE DATABASE billing_db;
CREATE DATABASE job_db;
CREATE DATABASE candidate_db;
CREATE DATABASE interview_db;
CREATE DATABASE resume_db;
CREATE DATABASE screening_db;
CREATE DATABASE notification_db;

-- All services use the same `postgres` superuser for local dev.
-- Production should create per-service users with limited grants.
