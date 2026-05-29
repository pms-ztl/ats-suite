/** Thin HTTP layer: validate -> delegate to the service -> respond. */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, getTenantId, getUserId } from "@cdc-ats/common";
import { RunBody } from "../schemas/agents.schemas.js";
import * as agentService from "../services/agents.service.js";

const router = Router();

router.get("/registry", (_req: Request, res: Response) => ok(res, agentService.registry()));

router.post("/run", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const { agentType, input } = RunBody.parse(req.body);
    ok(res, await agentService.runById(tenantId, userId, agentType, input));
  } catch (err) { next(err); }
});

router.get("/runs/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await agentService.getRun(getTenantId(req), req.params["id"] as string));
  } catch (err) { next(err); }
});

router.get("/runs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await agentService.listRuns(getTenantId(req), req.query["agentType"] as string | undefined));
  } catch (err) { next(err); }
});

export default router;
