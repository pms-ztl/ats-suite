# ═══════════════════════════════════════════════════════════════════════════════
#  CDC ATS - operator Makefile. Easy targets for the common deploy/run/observe
#  tasks. `make help` lists everything.
#
#  HONEST: these targets shell out to docker/compose/kubectl/helm/k6. They assume
#  the relevant tool is installed and (for k8s targets) a kubeconfig is pointed at
#  your cluster. Nothing here is tested against a live cluster - the k8s/helm
#  targets are convenience wrappers around the manifests in deploy/.
#
#  Override the defaults on the command line, e.g.
#    make deploy-helm REGISTRY=ghcr.io/acme VERSION=v1.4.0 NAMESPACE=cdc-ats
# ═══════════════════════════════════════════════════════════════════════════════

# ── Tunables ─────────────────────────────────────────────────────────────────
DEMO_COMPOSE   ?= docker-compose.demo.yml
PROD_COMPOSE   ?= deploy/compose/docker-compose.prod.yml
PROD_ENV       ?= deploy/compose/.env
K8S_DIR        ?= deploy/k8s
OBS_DIR        ?= deploy/k8s/observability
HELM_CHART     ?= infra/k8s/charts/cdc-ats
NAMESPACE      ?= cdc-ats
REGISTRY       ?= ghcr.io/cdc-ats
VERSION        ?= latest
# Target for the load test - the GATEWAY origin, no trailing /api (the harness
# appends /api itself). Defaults to the local gateway; point at your ingress/LB.
LOAD_TARGET    ?= http://localhost:4000

# All 15 backend services + frontend (the real docker-compose.demo.yml stack).
SERVICES := api-gateway identity-service tenant-service billing-service \
            job-service candidate-service interview-service resume-service \
            screening-service notification-service search-service agent-service \
            analytics-service compliance-service assessment-service

.DEFAULT_GOAL := help

# ── Help ─────────────────────────────────────────────────────────────────────
.PHONY: help
help: ## Show this help
	@echo "CDC ATS operator targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | sort \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Override vars, e.g.: make deploy-helm REGISTRY=ghcr.io/acme VERSION=v1.4.0"

# ── Local demo stack (single-host, full stack on a laptop) ───────────────────
.PHONY: up
up: ## Bring up the local demo stack (docker-compose.demo.yml) with a build
	docker compose -f $(DEMO_COMPOSE) up -d --build

.PHONY: down
down: ## Stop the demo stack (keep volumes)
	docker compose -f $(DEMO_COMPOSE) down

.PHONY: clean
clean: ## Stop the demo stack AND remove volumes (DESTROYS demo data)
	docker compose -f $(DEMO_COMPOSE) down -v

.PHONY: logs
logs: ## Tail logs for the demo stack (SVC=job-service to filter)
	docker compose -f $(DEMO_COMPOSE) logs -f $(SVC)

.PHONY: ps
ps: ## Show demo stack container status
	docker compose -f $(DEMO_COMPOSE) ps

# ── Scaled single-host prod stack (NGINX + PgBouncer + replicas) ─────────────
.PHONY: prod-up
prod-up: ## Bring up the scaled single-host prod stack (needs deploy/compose/.env)
	@test -f $(PROD_ENV) || { echo "Missing $(PROD_ENV) - cp deploy/compose/.env.prod.example $(PROD_ENV) and fill it in"; exit 1; }
	docker compose -f $(PROD_COMPOSE) --env-file $(PROD_ENV) up -d --build

.PHONY: prod-down
prod-down: ## Stop the scaled single-host prod stack
	docker compose -f $(PROD_COMPOSE) --env-file $(PROD_ENV) down

.PHONY: prod-scale
prod-scale: ## Scale hot-path services live, e.g. make prod-scale SCALE="job-service=6 resume-service=4"
	docker compose -f $(PROD_COMPOSE) --env-file $(PROD_ENV) up -d $(addprefix --scale ,$(SCALE))

.PHONY: prod-logs
prod-logs: ## Tail prod stack logs (SVC=nginx to filter)
	docker compose -f $(PROD_COMPOSE) --env-file $(PROD_ENV) logs -f $(SVC)

# ── Build images (matches the CI matrix / Dockerfiles) ───────────────────────
.PHONY: build
build: ## Build all service images + frontend locally (REGISTRY/VERSION tags)
	@for svc in $(SERVICES); do \
	  echo ">> building $$svc"; \
	  docker build -f infra/Dockerfile.service --build-arg SERVICE=$$svc \
	    -t $(REGISTRY)/$$svc:$(VERSION) . || exit 1; \
	done
	@echo ">> building frontend"
	docker build -f infra/Dockerfile.frontend -t $(REGISTRY)/frontend:$(VERSION) .

.PHONY: push
push: ## Push all locally-built images to REGISTRY at VERSION
	@for svc in $(SERVICES) frontend; do \
	  echo ">> pushing $$svc"; \
	  docker push $(REGISTRY)/$$svc:$(VERSION) || exit 1; \
	done

# ── Kubernetes deploy (raw manifests) ────────────────────────────────────────
.PHONY: deploy-k8s
deploy-k8s: ## Apply the raw k8s manifests (deploy/k8s). See README for ordered first bring-up.
	@echo "NOTE: apply -k does not order Jobs. For a FIRST bring-up follow $(K8S_DIR)/README.md."
	kubectl apply -k $(K8S_DIR)

.PHONY: deploy-k8s-images
deploy-k8s-images: ## Pin every k8s image to REGISTRY/VERSION then apply
	cd $(K8S_DIR) && for svc in $(SERVICES) frontend; do \
	  kustomize edit set image "ghcr.io/cdc-ats/$$svc=$(REGISTRY)/$$svc:$(VERSION)" 2>/dev/null || true; \
	done
	kubectl apply -k $(K8S_DIR)

.PHONY: k8s-status
k8s-status: ## Show k8s rollout status for the app namespace
	kubectl -n $(NAMESPACE) get deploy,po,hpa

.PHONY: k8s-rollback
k8s-rollback: ## Roll back a deployment: make k8s-rollback DEPLOY=job-service
	kubectl -n $(NAMESPACE) rollout undo deploy/$(DEPLOY)

# ── Helm deploy ──────────────────────────────────────────────────────────────
.PHONY: deploy-helm
deploy-helm: ## helm upgrade --install the cdc-ats chart at REGISTRY/VERSION
	@echo "NOTE: the shipped chart's services map covers 11 of 15 backend services;"
	@echo "      extend it or use 'make deploy-k8s' (kustomize, all 15). See docs/DEPLOYMENT.md."
	helm upgrade --install cdc-ats $(HELM_CHART) \
	  --namespace $(NAMESPACE) --create-namespace \
	  --values $(HELM_CHART)/values.yaml \
	  --values $(HELM_CHART)/values-production.yaml \
	  --set global.imageRegistry=$(REGISTRY) \
	  --set global.imageTag=$(VERSION) \
	  --atomic --wait --timeout 15m

.PHONY: helm-diff
helm-diff: ## Render the chart to stdout (dry-run, catch template errors)
	helm template cdc-ats $(HELM_CHART) \
	  --values $(HELM_CHART)/values.yaml \
	  --values $(HELM_CHART)/values-production.yaml

# ── Observability ────────────────────────────────────────────────────────────
.PHONY: observability
observability: ## Install the self-contained Prometheus + Grafana (deploy/k8s/observability)
	@echo "NOTE: create the grafana-admin secret first (see $(OBS_DIR)/README.md)."
	kubectl apply -k $(OBS_DIR)

.PHONY: grafana
grafana: ## Port-forward Grafana to localhost:3000
	kubectl -n cdc-ats-monitoring port-forward svc/grafana 3000:3000

.PHONY: prometheus
prometheus: ## Port-forward Prometheus to localhost:9090
	kubectl -n cdc-ats-monitoring port-forward svc/prometheus 9090:9090

# ── Load testing (cross-ref load-tests/) ─────────────────────────────────────
.PHONY: load-test
load-test: ## Run the 10k accept-fast apply load test against LOAD_TARGET (gateway origin; needs k6). Pass SLUG=<job-slug>.
	@command -v k6 >/dev/null || { echo "k6 not installed - see load-tests/README.md"; exit 1; }
	BASE_URL=$(LOAD_TARGET) SLUG=$(SLUG) TENANT=$(TENANT) k6 run load-tests/stress-10k.js

.PHONY: load-test-baseline
load-test-baseline: ## Run the lighter baseline load test against LOAD_TARGET
	@command -v k6 >/dev/null || { echo "k6 not installed - see load-tests/README.md"; exit 1; }
	BASE_URL=$(LOAD_TARGET) k6 run load-tests/baseline.js

# ── Backup (cross-ref docs/OPERATIONS.md, docs/BACKUP.md) ────────────────────
.PHONY: backup-db
backup-db: ## Dump all Postgres DBs from the demo stack to ./backups/ (pg_dumpall)
	@mkdir -p backups
	docker compose -f $(DEMO_COMPOSE) exec -T postgres pg_dumpall -U postgres \
	  > backups/cdc-ats-$$(date +%Y%m%d-%H%M%S).sql
	@echo "wrote backups/cdc-ats-<ts>.sql"
