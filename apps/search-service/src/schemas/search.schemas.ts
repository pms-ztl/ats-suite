import { z } from "zod";

export const SearchBody = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(100).default(20),
});
export type SearchInput = z.infer<typeof SearchBody>;

export const RankBody = z
  .object({
    requisitionId: z.string().optional(),
    query: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(20),
  })
  .refine((b) => Boolean(b.requisitionId || b.query), { message: "requisitionId or query is required" });
export type RankInput = z.infer<typeof RankBody>;

export const IndexBody = z.object({
  kind: z.enum(["CANDIDATE", "JOB"]),
  refId: z.string().min(1),
  title: z.string().default(""),
  text: z.string().default(""),
  skills: z.array(z.string()).default([]),
  embedding: z.array(z.number()).default([]),
  metadata: z.record(z.any()).default({}),
});
export type IndexInput = z.infer<typeof IndexBody>;
