/**
 * AppError — typed error class with HTTP status code + machine-readable code.
 * Throw from any handler; caught by the global error handler middleware.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details: unknown;

  constructor(code: string, message: string, status = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Common error factories
export const Errors = {
  unauthorized: (message = "Authentication required") =>
    new AppError("UNAUTHORIZED", message, 401),
  forbidden: (message = "Forbidden") => new AppError("FORBIDDEN", message, 403),
  notFound: (resource = "Resource") =>
    new AppError("NOT_FOUND", `${resource} not found`, 404),
  conflict: (message: string) => new AppError("CONFLICT", message, 409),
  validation: (message: string, details?: unknown) =>
    new AppError("VALIDATION_ERROR", message, 400, details),
  planLimit: (message: string) => new AppError("PLAN_LIMIT", message, 402),
  internalError: (message = "Internal server error") =>
    new AppError("INTERNAL_ERROR", message, 500),
  upstreamFailure: (service: string, message?: string) =>
    new AppError("UPSTREAM_FAILURE", message ?? `Upstream service ${service} unavailable`, 502),
};
