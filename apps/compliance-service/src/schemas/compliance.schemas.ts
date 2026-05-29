import { z } from "zod";

export const LogBody = z.object({
  kind: z.string().min(1).max(40),
  subjectType: z.string().max(40).default(""),
  subjectId: z.string().max(120).default(""),
  summary: z.string().max(2000).default(""),
  payload: z.record(z.any()).default({}),
});
export type LogInput = z.infer<typeof LogBody>;
