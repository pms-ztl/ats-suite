import { z } from "zod";

// Online assessment (OA) platform contracts. These describe the assessment
// definition, the candidate invite + attempt lifecycle, and the scored
// result both in raw and plan/role-normalized form. Every entity is
// tenant-scoped to match the rest of the platform.

export const QuestionTypeSchema = z.enum([
  "MCQ_SINGLE", "MCQ_MULTI", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "CODING",
]);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const QuestionOptionSchema = z.object({
  id: z.string().min(1).max(50),
  label: z.string().min(1).max(2000),
});
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

export const QuestionSchema = z.object({
  id: z.string().min(1).max(50),
  type: QuestionTypeSchema,
  prompt: z.string().min(1),
  order: z.number().int(),
  required: z.boolean().default(true),
  points: z.number().int().nonnegative().default(1),
  // Per-question time cap in seconds; null means it inherits the assessment cap.
  timeLimit: z.number().int().positive().nullable().optional(),
  // Choices for MCQ_SINGLE / MCQ_MULTI / TRUE_FALSE.
  options: z.array(QuestionOptionSchema).optional(),
  // Expected answer used by auto-grading: an option id, a set of option ids,
  // or a canonical string for SHORT_ANSWER. ESSAY/CODING are not auto-graded
  // here and leave this unset.
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  // Language hint for CODING questions (e.g. "python", "javascript").
  language: z.string().optional(),
  starterCode: z.string().optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const AssessmentStatusSchema = z.enum([
  "DRAFT", "PUBLISHED", "ARCHIVED",
]);
export type AssessmentStatus = z.infer<typeof AssessmentStatusSchema>;

export const AssessmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  requisitionId: z.string().uuid().nullable(),
  title: z.string().min(1).max(200),
  description: z.string().nullable(),
  status: AssessmentStatusSchema,
  // Overall time cap for the whole attempt, in minutes; null = untimed.
  durationMinutes: z.number().int().positive().nullable(),
  // Score (0-100) at or above which the attempt is considered passing.
  passingScore: z.number().int().min(0).max(100).nullable(),
  shuffleQuestions: z.boolean().default(false),
  questions: z.array(QuestionSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});
export type Assessment = z.infer<typeof AssessmentSchema>;

export const AssessmentInviteStatusSchema = z.enum([
  "PENDING", "SENT", "OPENED", "STARTED", "SUBMITTED", "EXPIRED", "REVOKED",
]);
export type AssessmentInviteStatus = z.infer<typeof AssessmentInviteStatusSchema>;

export const AssessmentInviteSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  candidateId: z.string().uuid(),
  applicationId: z.string().nullable(),
  // Opaque single-use token the candidate uses to open the assessment.
  token: z.string().min(1),
  email: z.string().email(),
  status: AssessmentInviteStatusSchema,
  expiresAt: z.string().datetime().nullable(),
  sentAt: z.string().datetime().nullable(),
  startedAt: z.string().datetime().nullable(),
  submittedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type AssessmentInvite = z.infer<typeof AssessmentInviteSchema>;

export const AttemptStatusSchema = z.enum([
  "IN_PROGRESS", "SUBMITTED", "EXPIRED", "GRADED",
]);
export type AttemptStatus = z.infer<typeof AttemptStatusSchema>;

export const AnswerSchema = z.object({
  questionId: z.string().min(1).max(50),
  // Candidate response: a single value for SHORT_ANSWER/ESSAY/CODING/TRUE_FALSE,
  // or an array of selected option ids for MCQ_MULTI.
  value: z.union([z.string(), z.array(z.string())]).nullable(),
  // Seconds the candidate spent on this question, when tracked.
  timeSpentSeconds: z.number().int().nonnegative().optional(),
});
export type Answer = z.infer<typeof AnswerSchema>;

export const AttemptSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  inviteId: z.string().uuid(),
  candidateId: z.string().uuid(),
  status: AttemptStatusSchema,
  answers: z.array(AnswerSchema),
  startedAt: z.string().datetime().nullable(),
  submittedAt: z.string().datetime().nullable(),
  // Wall-clock duration of the attempt in seconds, when computed.
  durationSeconds: z.number().int().nonnegative().nullable(),
  createdAt: z.string().datetime(),
});
export type Attempt = z.infer<typeof AttemptSchema>;

export const QuestionResultSchema = z.object({
  questionId: z.string().min(1).max(50),
  // True for auto-graded questions; null for ESSAY/CODING awaiting manual review.
  correct: z.boolean().nullable(),
  pointsAwarded: z.number().nonnegative(),
  pointsPossible: z.number().nonnegative(),
  // Set when a human grader scored an open-ended question.
  manuallyGraded: z.boolean().default(false),
});
export type QuestionResult = z.infer<typeof QuestionResultSchema>;

export const AssessmentResultSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  attemptId: z.string().uuid(),
  candidateId: z.string().uuid(),
  rawScore: z.number().nonnegative(),
  maxScore: z.number().nonnegative(),
  passed: z.boolean().nullable(),
  // True while any open-ended question is still awaiting manual grading.
  pendingManualReview: z.boolean().default(false),
  perQuestion: z.array(QuestionResultSchema),
  gradedAt: z.string().datetime().nullable(),
});
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;

// A scale-invariant view of a result used for cross-assessment comparison and
// downstream pipeline/screening decisions. score/percentile are 0-100.
export const NormalizedResultSchema = z.object({
  assessmentId: z.string().uuid(),
  attemptId: z.string().uuid(),
  candidateId: z.string().uuid(),
  score: z.number().min(0).max(100),
  percentile: z.number().min(0).max(100).nullable(),
  passed: z.boolean().nullable(),
  band: z.enum(["TOP", "STRONG", "MIXED", "WEAK"]).nullable(),
});
export type NormalizedResult = z.infer<typeof NormalizedResultSchema>;
