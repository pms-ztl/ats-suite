import { z } from "zod";

export const IngestBody = z.object({
  metric: z.string().min(1).max(80),
  dimension: z.string().max(120).default("all"),
  period: z.string().max(20).default("all"),
  delta: z.number().int().default(1),
});
export type IngestInput = z.infer<typeof IngestBody>;
