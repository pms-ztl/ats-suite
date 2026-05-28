import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors, getTenantId } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /internal/screening?requisitionId=&status=
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = req.query["requisitionId"] as string | undefined;
    const candidateId = req.query["candidateId"] as string | undefined;
    const status = req.query["status"] as string | undefined;
    const where: any = { tenantId };
    if (requisitionId) where.requisitionId = requisitionId;
    if (candidateId) where.candidateId = candidateId;
    if (status) where.status = status;
    const rows = await prisma.screening.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
    ok(res, rows);
  } catch (err) { next(err); }
});

// GET /internal/screening/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const row = await prisma.screening.findFirst({ where: { id, tenantId } });
    if (!row) throw Errors.notFound("Screening");
    ok(res, row);
  } catch (err) { next(err); }
});

export default router;
