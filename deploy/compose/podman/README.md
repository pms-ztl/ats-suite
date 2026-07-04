# Podman Quadlet units (systemd-native, rootful or rootless)

Quadlet lets systemd manage Podman containers directly from `.container` /
`.network` unit files - no compose runtime. This directory is a **starter**: it
provides the network, the infra units (Postgres, PgBouncer, Redis, NATS, MinIO),
NGINX, and a representative set of ATS service units (api-gateway, job-service,
resume-service, frontend). It is **not** the full 15-service stack - copy
`job-service.container` as the template for the remaining services (change
`Image`, the `SERVICE` build note, `PORT`, and the DB URL), or just use
`docker-compose.prod.yml` with `podman-compose`, which is simpler.

## Honest status

Not tested against a live host. Quadlet requires Podman 4.4+ (systemd generator
at `/usr/lib/systemd/system-generators/podman-system-generator`). These units
assume the images are already built/pulled into the local Podman store (Quadlet
does not build - build with `podman build -f infra/Dockerfile.service
--build-arg SERVICE=<svc> -t localhost/cdc-ats/<svc>:latest .` from the repo root,
or pull from your registry and change the `Image=` lines).

## Install

```
# System-wide (rootful):
sudo cp *.network *.container /etc/containers/systemd/
sudo systemctl daemon-reload
sudo systemctl start cdc-ats-postgres.service   # etc, or enable a target

# Rootless (per-user):
mkdir -p ~/.config/containers/systemd
cp *.network *.container ~/.config/containers/systemd/
systemctl --user daemon-reload
systemctl --user start cdc-ats-postgres.service
```

Secrets: use `podman secret create` and reference them, or an `EnvironmentFile=`
pointing at a root-only `/etc/cdc-ats/prod.env` (same keys as
`../.env.prod.example`). Do **not** put secrets literally in the unit files.

Scaling: Quadlet has no `replicas`. For multiple instances, either use a systemd
template unit (`cdc-ats-job-service@.container` + `systemctl start
cdc-ats-job-service@{1,2,3}`) or run the compose file with `podman-compose
--scale`. The `docker-compose.prod.yml` path is the easier way to get replicas.
