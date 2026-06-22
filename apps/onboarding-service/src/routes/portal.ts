/**
 * Module F — PUBLIC candidate onboarding portal (no JWT). Mounted at
 * /public/onboarding (gateway: /api/public/onboarding). The opaque portalToken in
 * the path IS the credential; the tenant is resolved from the case row via the
 * admin client. The candidate submits their profile, documents, PAN, and bank
 * details; verifications run through the pluggable KYC provider (stub by default,
 * which records an honest NEEDS_PROVIDER result — never a fabricated pass).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors } from "@cdc-ats/common";
import { SubmitPanSchema, SubmitBankAccountSchema } from "@cdc-ats/contracts";
import { prismaAdmin } from "../lib/prisma.js";
import { getKycProvider } from "../lib/kyc.js";
import { recomputeStatus } from "../lib/case-service.js";

const router = Router();

async function loadCaseByToken(token: string) {
  const c = await prismaAdmin.onboardingCase.findUnique({
    where: { portalToken: token },
    include: { tasks: { orderBy: { order: "asc" } }, documents: true, verifications: true },
  });
  if (!c) throw Errors.notFound("Onboarding link");
  return c;
}

// Strip internal fields before returning to the (unauthenticated) candidate.
function publicView(c: Awaited<ReturnType<typeof loadCaseByToken>>) {
  return {
    id: c.id,
    candidateName: c.candidateName,
    jobTitle: c.jobTitle,
    status: c.status,
    startDate: c.startDate,
    tasks: c.tasks.map((t) => ({ id: t.id, kind: t.kind, title: t.title, description: t.description, required: t.required, status: t.status, order: t.order })),
    documents: c.documents.map((d) => ({ id: d.id, label: d.label, fileName: d.fileName, uploadedAt: d.uploadedAt })),
    verifications: c.verifications.map((v) => ({ type: v.type, status: v.status, provider: v.provider, maskedValue: v.maskedValue, message: v.message, verifiedAt: v.verifiedAt })),
  };
}

// GET /public/onboarding/:token — the candidate's onboarding case.
router.get("/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await loadCaseByToken(req.params["token"] as string);
    ok(res, publicView(c));
  } catch (err) { next(err); }
});

// POST /public/onboarding/:token/pan — submit + verify PAN.
router.post("/:token/pan", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await loadCaseByToken(req.params["token"] as string);
    const body = SubmitPanSchema.parse(req.body);
    const provider = getKycProvider();
    const result = await provider.verify({ type: "PAN", pan: body.pan, nameOnPan: body.nameOnPan });
    await prismaAdmin.verification.upsert({
      where: { caseId_type: { caseId: c.id, type: "PAN" } },
      create: { tenantId: c.tenantId, caseId: c.id, type: "PAN", status: result.status, provider: result.provider, providerRef: result.providerRef, maskedValue: result.maskedValue, message: result.message, verifiedAt: result.status === "VERIFIED" ? new Date() : null },
      update: { status: result.status, provider: result.provider, providerRef: result.providerRef, maskedValue: result.maskedValue, message: result.message, verifiedAt: result.status === "VERIFIED" ? new Date() : null },
    });
    await markVerificationTaskDone(c.id, "Verify your PAN");
    await recomputeStatus(c.id);
    ok(res, publicView(await loadCaseByToken(req.params["token"] as string)));
  } catch (err) { next(err); }
});

// POST /public/onboarding/:token/bank — submit + verify bank account.
router.post("/:token/bank", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await loadCaseByToken(req.params["token"] as string);
    const body = SubmitBankAccountSchema.parse(req.body);
    const provider = getKycProvider();
    const result = await provider.verify({ type: "BANK_ACCOUNT", accountNumber: body.accountNumber, ifsc: body.ifsc, accountHolder: body.accountHolder });
    await prismaAdmin.verification.upsert({
      where: { caseId_type: { caseId: c.id, type: "BANK_ACCOUNT" } },
      create: { tenantId: c.tenantId, caseId: c.id, type: "BANK_ACCOUNT", status: result.status, provider: result.provider, providerRef: result.providerRef, maskedValue: result.maskedValue, message: result.message, verifiedAt: result.status === "VERIFIED" ? new Date() : null },
      update: { status: result.status, provider: result.provider, providerRef: result.providerRef, maskedValue: result.maskedValue, message: result.message, verifiedAt: result.status === "VERIFIED" ? new Date() : null },
    });
    await markVerificationTaskDone(c.id, "Add your bank account");
    await recomputeStatus(c.id);
    ok(res, publicView(await loadCaseByToken(req.params["token"] as string)));
  } catch (err) { next(err); }
});

// POST /public/onboarding/:token/tasks/:taskId/complete — mark a task submitted/done.
router.post("/:token/tasks/:taskId/complete", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await loadCaseByToken(req.params["token"] as string);
    const taskId = req.params["taskId"] as string;
    const task = c.tasks.find((t) => t.id === taskId);
    if (!task) throw Errors.notFound("Task");
    await prismaAdmin.onboardingTask.update({
      where: { id: taskId },
      data: { status: "DONE", completedAt: new Date() },
    });
    await recomputeStatus(c.id);
    ok(res, publicView(await loadCaseByToken(req.params["token"] as string)));
  } catch (err) { next(err); }
});

// Mark the VERIFICATION task with the given title as DONE (best-effort).
async function markVerificationTaskDone(caseId: string, title: string): Promise<void> {
  await prismaAdmin.onboardingTask.updateMany({
    where: { caseId, title, kind: "VERIFICATION" },
    data: { status: "DONE", completedAt: new Date() },
  });
}

export default router;
