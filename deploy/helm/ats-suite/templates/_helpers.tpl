{{/*
══════════════════════════════════════════════════════════════════════════════
  ats-suite - reusable template helpers
══════════════════════════════════════════════════════════════════════════════
*/}}

{{/* Chart name (truncated to the k8s 63-char DNS limit). */}}
{{- define "ats.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
  Fullname prefix. Kept as the bare service name in most templates (the compose
  service names ARE the in-cluster DNS names, and the ConfigMap/Secret/probe
  wiring across services assumes stable names like "job-service"). We therefore
  do NOT prefix object names with the release - a helper is provided if you ever
  want release-scoped names.
*/}}
{{- define "ats.fullname" -}}
{{- printf "%s" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Common labels attached to every managed object. */}}
{{- define "ats.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: {{ .Values.global.partOf }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end -}}

{{/*
  Selector labels for a named component. Call as:
    {{ include "ats.selectorLabels" (dict "name" "job-service") }}
  (Selectors must be STABLE across upgrades, so they carry only name + instance.)
*/}}
{{- define "ats.selectorLabels" -}}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .instance }}
{{- end -}}

{{/*
  Full label set for a named component. Call as:
    {{ include "ats.componentLabels" (dict "name" "job-service" "root" $) }}
*/}}
{{- define "ats.componentLabels" -}}
{{ include "ats.labels" .root }}
app.kubernetes.io/name: {{ .name }}
{{- end -}}

{{/*
  Resolve a service's container image reference.
    {{ include "ats.image" (dict "svc" .svc "name" $name "root" $) }}
  Precedence: per-service image.repository/tag  >  global.image.repository + name
  and global.image.tag. Registry is always global.image.registry.
*/}}
{{- define "ats.image" -}}
{{- $g := .root.Values.global.image -}}
{{- $svc := .svc -}}
{{- $repo := "" -}}
{{- if and $svc.image $svc.image.repository -}}
  {{- $repo = $svc.image.repository -}}
{{- else -}}
  {{- $repo = printf "%s/%s" $g.repository .name -}}
{{- end -}}
{{- $tag := $g.tag -}}
{{- if and $svc.image $svc.image.tag -}}
  {{- $tag = $svc.image.tag -}}
{{- end -}}
{{- printf "%s/%s:%s" $g.registry $repo $tag -}}
{{- end -}}

{{/* imagePullSecrets block (rendered only when set). */}}
{{- define "ats.imagePullSecrets" -}}
{{- with .Values.global.imagePullSecrets -}}
imagePullSecrets:
{{ toYaml . | indent 2 }}
{{- end -}}
{{- end -}}

{{/* The name of the Secret every service references (existing or chart-created). */}}
{{- define "ats.secretName" -}}
{{- if .Values.secrets.existingSecret -}}
{{- .Values.secrets.existingSecret -}}
{{- else -}}
cdc-ats-secrets
{{- end -}}
{{- end -}}

{{/*
  Standard health probes for a backend service (real /healthz /livez /readyz that
  packages/common mounts). Call with the port NAME "http".
    {{ include "ats.backendProbes" . | nindent 10 }}
*/}}
{{- define "ats.backendProbes" -}}
startupProbe:
  httpGet: { path: /healthz, port: http }
  periodSeconds: 5
  failureThreshold: 30
livenessProbe:
  httpGet: { path: /livez, port: http }
  initialDelaySeconds: 20
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /readyz, port: http }
  initialDelaySeconds: 5
  periodSeconds: 5
{{- end -}}

{{/*
  Frontend probes - it has no /healthz, so probe "/" (matches the demo image).
*/}}
{{- define "ats.frontendProbes" -}}
startupProbe:
  httpGet: { path: /, port: http }
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 60
livenessProbe:
  httpGet: { path: /, port: http }
  initialDelaySeconds: 30
  periodSeconds: 15
readinessProbe:
  httpGet: { path: /, port: http }
  initialDelaySeconds: 10
  periodSeconds: 5
{{- end -}}

{{/*
  Build a per-service DATABASE_URL value FROM postgres.* when the operator has not
  overridden it in secrets.databaseUrls. Appends the job-service pool params when
  the service block sets dbConnectionLimit. Call as:
    {{ include "ats.databaseUrl" (dict "svc" .svc "root" $) }}
  Returns the URL string, or "" when the service has no dbKey.
  NOTE: this is used only to POPULATE the Secret (templates/secret.yaml). Services
  always READ their URL from the Secret, never from this inline value.
*/}}
{{- define "ats.databaseUrl" -}}
{{- $svc := .svc -}}
{{- $root := .root -}}
{{- if $svc.dbKey -}}
  {{- $override := index $root.Values.secrets.databaseUrls $svc.dbKey -}}
  {{- if $override -}}
    {{- $override -}}
  {{- else -}}
    {{- $pg := $root.Values.postgres -}}
    {{- $pass := $root.Values.secrets.postgresPassword -}}
    {{- $db := lower (trimSuffix "_DATABASE_URL" $svc.dbKey) -}}
    {{- $db = printf "%s_db" $db -}}
    {{- $base := printf "postgresql://%s:%s@%s:%v/%s" $pg.user $pass $pg.host $pg.port $db -}}
    {{- if $svc.dbConnectionLimit -}}
      {{- printf "%s?connection_limit=%v&pool_timeout=%v" $base $svc.dbConnectionLimit (default 20 $svc.dbPoolTimeout) -}}
    {{- else -}}
      {{- $base -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- end -}}

{{/*
  Whether a service should get an HPA: global autoscaling on AND the service block
  opts in. Call as: {{ include "ats.hpaEnabled" (dict "svc" .svc "root" $) }}
  -> "true" or "".
*/}}
{{- define "ats.hpaEnabled" -}}
{{- if and .root.Values.autoscaling.enabled .svc.autoscaling .svc.autoscaling.enabled -}}
true
{{- end -}}
{{- end -}}
