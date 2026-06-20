/** Thin HTTP layer: validate -> delegate to the service -> respond. */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, created, getTenantId, getUserId } from "@cdc-ats/common";
import { LogBody } from "../schemas/compliance.schemas.js";
import * as complianceService from "../services/compliance.service.js";

const router = Router();

router.post("/audit/log", async (req: Request, res: Response, next: NextFunction) => {
  try {
    created(res, await complianceService.log(getTenantId(req), getUserId(req), LogBody.parse(req.body)));
  } catch (err) { next(err); }
});

router.get("/audit", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await complianceService.list(getTenantId(req), req.query["kind"] as string | undefined));
  } catch (err) { next(err); }
});

router.get("/audit/subject/:subjectId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await complianceService.forSubject(getTenantId(req), req.params["subjectId"] as string));
  } catch (err) { next(err); }
});

router.get("/retention/policy", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await complianceService.retentionPolicy(getTenantId(req)));
  } catch (err) { next(err); }
});

router.post("/bias-audit/:requisitionId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await complianceService.biasAudit(getTenantId(req), getUserId(req), req.params["requisitionId"] as string));
  } catch (err) { next(err); }
});

// WF10/J1 - candidate DSR legs that ALSO cover Online Assessment data. These call
// assessment-service (export / erase by candidateId) and write an audit record.
// The api-gateway candidate fan-out covers OA directly too; these exist so a DSR
// driven from compliance-service (the system of record for the request) reaches
// the OA rows and leaves an audit trail.
router.post("/dsr/candidates/:candidateId/export", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await complianceService.dsrAssessmentExport(getTenantId(req), getUserId(req), req.params["candidateId"] as string));
  } catch (err) { next(err); }
});

router.delete("/dsr/candidates/:candidateId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await complianceService.dsrAssessmentErase(getTenantId(req), getUserId(req), req.params["candidateId"] as string));
  } catch (err) { next(err); }
});

export default router;
