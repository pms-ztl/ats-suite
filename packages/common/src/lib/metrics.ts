/**
 * Prometheus metrics — one registry per service, exposed at GET /metrics.
 * Standard HTTP metrics auto-recorded via the metricsMiddleware factory.
 */
import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";
import type { Request, Response, NextFunction, RequestHandler } from "express";

export interface MetricsBundle {
  registry: Registry;
  httpRequests: Counter<string>;
  httpDuration: Histogram<string>;
  middleware: RequestHandler;
}

export function createMetrics(serviceName: string): MetricsBundle {
  const registry = new Registry();
  registry.setDefaultLabels({ service: serviceName });
  collectDefaultMetrics({ register: registry });

  const httpRequests = new Counter({
    name: "http_requests_total",
    help: "Total HTTP requests received",
    labelNames: ["method", "route", "status"],
    registers: [registry],
  });

  const httpDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [registry],
  });

  const middleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const startedAt = process.hrtime.bigint();
    res.on("finish", () => {
      const route = (req.route?.path ?? req.path) || "unknown";
      const labels = {
        method: req.method,
        route,
        status: String(res.statusCode),
      };
      httpRequests.inc(labels);
      const seconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
      httpDuration.observe(labels, seconds);
    });
    next();
  };

  return { registry, httpRequests, httpDuration, middleware };
}
