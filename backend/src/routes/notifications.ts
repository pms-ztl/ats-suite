import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { ok, created } from '../lib/response';
import { sendEmail, EmailTemplates } from '../lib/mailer';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(requireAuth);

const SendEmailSchema = z.object({
  to: z.string().email().or(z.array(z.string().email())),
  templateType: z.enum(['candidateInvite', 'offerLetter', 'applicationReceived', 'interviewReminder']),
  params: z.record(z.string(), z.string()),
});

// POST /notifications/email/send
router.post('/email/send', async (req, res, next) => {
  try {
    const body = SendEmailSchema.parse(req.body);
    const { to, templateType, params } = body;

    let template: { subject: string; html: string };

    switch (templateType) {
      case 'candidateInvite':
        template = EmailTemplates.candidateInvite(params.candidateName, params.interviewDate, params.link);
        break;
      case 'offerLetter':
        template = EmailTemplates.offerLetter(params.candidateName, params.role, params.link);
        break;
      case 'applicationReceived':
        template = EmailTemplates.applicationReceived(params.candidateName, params.role);
        break;
      case 'interviewReminder':
        template = EmailTemplates.interviewReminder(params.candidateName, params.interviewDate, params.location);
        break;
      default:
        throw new AppError('INVALID_TEMPLATE', 'Unknown email template', 400);
    }

    await sendEmail({ to, ...template });
    return ok(res, { sent: true, to, subject: template.subject });
  } catch (err) { return next(err); }
});

// GET /notifications/templates
router.get('/templates', async (_req, res, next) => {
  try {
    return ok(res, {
      templates: [
        { id: 'candidateInvite', name: 'Interview Invitation', params: ['candidateName', 'interviewDate', 'link'] },
        { id: 'offerLetter', name: 'Offer Letter', params: ['candidateName', 'role', 'link'] },
        { id: 'applicationReceived', name: 'Application Received', params: ['candidateName', 'role'] },
        { id: 'interviewReminder', name: 'Interview Reminder', params: ['candidateName', 'interviewDate', 'location'] },
      ],
    });
  } catch (err) { return next(err); }
});

export default router;
