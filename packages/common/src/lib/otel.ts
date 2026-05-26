/**
 * OpenTelemetry initialization — call once at service startup, before any
 * other imports of instrumented modules.
 *
 *   import { initOpenTelemetry } from "@cdc-ats/common";
 *   initOpenTelemetry({ serviceName: "identity-service" });
 *   // ...then import express, prisma, etc.
 */
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

export interface OtelOptions {
  serviceName: string;
  /** Jaeger collector endpoint. Defaults to JAEGER_ENDPOINT env or http://jaeger:14268/api/traces */
  jaegerEndpoint?: string;
  /** Skip OTel entirely if env says so (useful for unit tests). */
  enabled?: boolean;
}

let sdk: NodeSDK | null = null;

export function initOpenTelemetry(opts: OtelOptions): NodeSDK | null {
  if (opts.enabled === false) return null;
  if (process.env["OTEL_DISABLED"] === "true") return null;
  if (sdk) return sdk;

  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: opts.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env["SERVICE_VERSION"] ?? "0.0.1",
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env["NODE_ENV"] ?? "development",
    }),
    traceExporter: new JaegerExporter({
      endpoint: opts.jaegerEndpoint ?? process.env["JAEGER_ENDPOINT"] ?? "http://jaeger:14268/api/traces",
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false }, // noisy
      }),
    ],
  });

  sdk.start();

  process.on("SIGTERM", () => {
    sdk?.shutdown().catch(() => {});
  });

  return sdk;
}
