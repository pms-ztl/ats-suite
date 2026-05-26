{{/* Per-service helpers — applied to each entry in .Values.services */}}

{{- define "cdc-ats.serviceFullname" -}}
{{- printf "%s" .name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "cdc-ats.serviceLabels" -}}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .release }}
app.kubernetes.io/component: backend
app.kubernetes.io/part-of: cdc-ats
{{- end -}}

{{- define "cdc-ats.selectorLabels" -}}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .release }}
{{- end -}}

{{/* Merge defaults with per-service spec, used inline as
    (include "cdc-ats.merged" (dict "defaults" $.Values.defaults "spec" $svc)) */}}
{{- define "cdc-ats.merged" -}}
{{- $merged := merge (deepCopy .spec) (deepCopy .defaults) -}}
{{- toYaml $merged -}}
{{- end -}}
