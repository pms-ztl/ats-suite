import { z } from "zod";

export const RunBody = z.object({
  agentType: z.string().min(1),
  input: z.record(z.any()).default({}),
});
export type RunInput = z.infer<typeof RunBody>;
