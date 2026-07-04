# CDC ATS - Observability

Self-contained monitoring for the CDC ATS stack: Prometheus (metrics + alert
rules) and Grafana (a throughput / latency / error-rate / queue-depth /
replica-count dashboard).

## Honest status

These manifests are **derived from** `docker-compose.demo.yml` and the app
manifests in `deploy/k8s/`, and have **not** been run against a live cluster.
Treat them as a working starting point, not a battle-tested install. Specifics:

- Single-replica Prometheus and Grafana with `emptyDir` storage - data is lost on
  pod restart. Fine for a demo/staging monitor; add PVCs and Alertmanager (and
  prefer the Prometheus Operator) for production.
- Several alert rules need **extra exporters** that this bundle does not ship:
  - Pod / HPA / deployment alerts + the replica-count panel need
    **kube-state-metrics** (a standard cluster add-on).
  - The Postgres-saturation alerts need **postgres_exporter**.
  - The BullMQ queue-backlog alert + the queue-depth Grafana panel need a
    **queue-depth exporter** (the in-process workers do not export
    `bullmq_queue_waiting` today - see `30-alert-rules.yaml`). Until then those
    two are inert placeholders that mark the wiring target.
- The app-request alerts (error rate, p95 latency, service down, no-traffic) work
  with **no extra exporters** - they run entirely off the `/metrics` every service
  already exposes.

## What the services actually expose

Every backend service and the api-gateway mount `GET /metrics` via
`packages/common/src/lib/metrics.ts` (prom-client). Real metric names:

- `http_requests_total{service,method,route,status}` - request counter
- `http_request_duration_seconds{,_bucket,_sum,_count}` - latency histogram
- prom-client defaults: `process_cpu_seconds_total`,
  `process_resident_memory_bytes`, `nodejs_*`, etc.

The `service` label is set per registry; the dashboard/alerts also use the `app`
label, which Prometheus derives from the pod's `app.kubernetes.io/name` label via
the relabel config. The frontend is a Next.js server with **no** `/metrics`
endpoint, so it is intentionally not scraped.

Discovery is annotation-driven: the app Deployments carry
`prometheus.io/scrape: "true"`, `prometheus.io/port: "<port>"`,
`prometheus.io/path: /metrics` (see `deploy/k8s/40-api-gateway.yaml:24-27` and
every `4x-*.yaml`). The scrape config keys off those, so a service on a non-4000
port (e.g. `job-service:4004`) is scraped correctly with no per-service config.

## Two ways to run it

### Path A - self-contained Prometheus (no CRDs)

The default. A plain Prometheus Deployment scrapes via Kubernetes SD, plus
Grafana. No operator, no CRDs.

```
# 1. Create the Grafana admin secret (NEVER commit a real password)
kubectl create namespace cdc-ats-monitoring
kubectl -n cdc-ats-monitoring create secret generic grafana-admin \
  --from-literal=admin-user=admin \
  --from-literal=admin-password='<choose-a-strong-password>'

# 2. Apply everything
kubectl apply -k deploy/k8s/observability/

# 3. View
kubectl -n cdc-ats-monitoring port-forward svc/grafana 3000:3000     # Grafana
kubectl -n cdc-ats-monitoring port-forward svc/prometheus 9090:9090  # Prometheus UI
```

Grafana auto-provisions the Prometheus datasource and the **CDC ATS - Overview**
dashboard (`dashboards/cdc-ats-overview.json`).

### Path B - Prometheus Operator (kube-prometheus-stack)

If you already run the Operator, do **not** run the path-A Prometheus (you would
have two). Instead:

1. In `kustomization.yaml`, comment out `15-prometheus-rbac.yaml` +
   `20-prometheus.yaml` and uncomment `40-servicemonitors.yaml`.
2. Ensure the `PodMonitor` label matches your Prometheus CR's
   `podMonitorSelector` (kube-prometheus-stack default is `release: <name>`).
3. Import `dashboards/cdc-ats-overview.json` into the stack's Grafana, or keep the
   Grafana here and point its datasource at the Operator's Prometheus Service.

`40-servicemonitors.yaml` ships a `PodMonitor` + a `PrometheusRule` mirroring the
same alerts. It **requires** the `monitoring.coreos.com` CRDs.

## File map

| File | Purpose |
| --- | --- |
| `00-namespace.yaml` | `cdc-ats-monitoring` namespace |
| `10-prometheus-config.yaml` | Prometheus scrape config (literal ConfigMap, path A) |
| `15-prometheus-rbac.yaml` | ServiceAccount + ClusterRole for Kubernetes SD |
| `20-prometheus.yaml` | Prometheus Deployment + Service |
| `30-alert-rules.yaml` | Alert rules (literal ConfigMap, path A) |
| `40-servicemonitors.yaml` | PodMonitor + PrometheusRule CRs (path B, Operator) |
| `50-grafana.yaml` | Grafana Deployment + Service + provisioning |
| `configs/prometheus.yml` | Scrape config source for the kustomize generator |
| `configs/ats-alerts.yaml` | Alert-rules source for the kustomize generator |
| `dashboards/cdc-ats-overview.json` | The Grafana dashboard |
| `kustomization.yaml` | Self-contained bundle (path A by default) |

## Cross-references

- Scaling story + the honest queue-depth/RPS-scaling gap: `docs/SCALABILITY.md`
- Operations (dashboards to watch, alert response): `docs/OPERATIONS.md`
- The HPAs the replica-count panel visualizes: `deploy/k8s/55-autoscalers.yaml`
