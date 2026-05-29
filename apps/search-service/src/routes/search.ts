/** Thin HTTP layer: validate -> delegate to the service -> respond. */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, getTenantId } from "@cdc-ats/common";
import { SearchBody, RankBody, IndexBody } from "../schemas/search.schemas.js";
import * as searchService from "../services/search.service.js";

const router = Router();

router.post("/candidates", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { query, limit } = SearchBody.parse(req.body);
    const results = await searchService.search(tenantId, "CANDIDATE", query, limit);
    ok(res, { query, kind: "candidate", count: results.length, results });
  } catch (err) { next(err); }
});

router.post("/jobs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { query, limit } = SearchBody.parse(req.body);
    const results = await searchService.search(tenantId, "JOB", query, limit);
    ok(res, { query, kind: "job", count: results.length, results });
  } catch (err) { next(err); }
});

router.post("/match/rank", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = RankBody.parse(req.body);
    const results = await searchService.rankCandidates(tenantId, body);
    ok(res, { requisitionId: body.requisitionId ?? null, count: results.length, results });
  } catch (err) { next(err); }
});

router.post("/index", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const input = IndexBody.parse(req.body);
    const { id } = await searchService.indexDocument(tenantId, input);
    ok(res, { indexed: true, id });
  } catch (err) { next(err); }
});

export default router;
