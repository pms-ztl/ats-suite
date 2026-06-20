/**
 * Shared AJV 8 instance + helpers — the server-side trust boundary for any
 * JSON-Schema-validated payload (notably OA assessment `schemaJson` and the
 * candidate submissions checked against it).
 *
 * On failure, {@link validateOrThrow} throws an {@link AppError} with code
 * `VALIDATION_ERROR` / status 400 carrying `details: { field, message }[]`.
 * That envelope is byte-identical to the one the shared error handler emits for
 * zod failures (see middleware/error-handler.ts), so AJV and zod validation
 * surface the SAME 400 shape to callers regardless of which layer rejected.
 */
import Ajv from "ajv";
import type { AnySchema, ErrorObject, ValidateFunction } from "ajv";
import { AppError } from "../lib/error.js";

/** A single cleaned validation failure — mirrors the zod mapping in the error handler. */
export interface ValidationIssue {
  /** Dotted path to the offending value, e.g. `fields.0.label` (empty for a root-level error). */
  field: string;
  /** Human-readable description of what failed. */
  message: string;
}

/**
 * The shared AJV 8 instance used across all services.
 * - `allErrors`: collect every failure (not just the first) so callers get a
 *   complete issue list, matching zod's `.issues` behavior.
 * - `strict: false`: tolerate unknown keywords / extra schema metadata instead
 *   of throwing at compile time — tenant-authored OA schemas are not trusted to
 *   be strict-clean.
 * - `coerceTypes: false`: never silently mutate the submitted data (a real trust
 *   boundary must reject a `"3"` where a `number` is required, not coerce it).
 */
export const ajv = new Ajv({
  allErrors: true,
  strict: false,
  coerceTypes: false,
});

/**
 * Compile a JSON Schema into a reusable, typed validate function. Thin wrapper
 * over `ajv.compile` so callers depend on `@cdc-ats/common` rather than `ajv`
 * directly (single AJV instance, single place to tune options). Cache the
 * returned function and reuse it — compilation is the expensive step.
 *
 * @throws the raw AJV compile error if `schema` is not a valid JSON Schema.
 */
export function compileSchema<T = unknown>(schema: AnySchema): ValidateFunction<T> {
  return ajv.compile<T>(schema);
}

/** Map a raw AJV error to the clean `{ field, message }` shape. */
function toIssue(err: ErrorObject): ValidationIssue {
  // AJV's `instancePath` is a JSON Pointer (e.g. `/fields/0/label`). Convert it
  // to the dotted form the zod path produces (`fields.0.label`). For a missing
  // required property AJV reports the path of the PARENT object, so append the
  // absent key from `params.missingProperty` to point at the real offender.
  const segments = err.instancePath.split("/").filter(Boolean);
  const missing = (err.params as { missingProperty?: unknown }).missingProperty;
  if (err.keyword === "required" && typeof missing === "string") {
    segments.push(missing);
  }
  return {
    field: segments.join("."),
    message: err.message ?? "is invalid",
  };
}

/**
 * Validate `data` against `schema` and return it (typed) on success. On failure
 * throws an `AppError` (`VALIDATION_ERROR`, 400) whose `details` is a
 * `{ field, message }[]` list — picked up unchanged by the global error handler
 * and returned as `{ success: false, error: { code, message, details } }`.
 *
 * `schema` may be a JSON Schema object or a pre-compiled `ValidateFunction`
 * (from {@link compileSchema}); pass the compiled function on hot paths to skip
 * recompilation.
 */
export function validateOrThrow<T = unknown>(
  schema: AnySchema | ValidateFunction<T>,
  data: unknown
): T {
  const validate: ValidateFunction<T> =
    typeof schema === "function" ? schema : compileSchema<T>(schema);

  if (validate(data)) {
    return data as T;
  }

  const issues: ValidationIssue[] = (validate.errors ?? []).map(toIssue);
  throw new AppError("VALIDATION_ERROR", "Request validation failed", 400, issues);
}
