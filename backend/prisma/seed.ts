import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../node_modules/.prisma/client/client.js';
import { hashPassword } from '../src/lib/password.js';

// ── Fixed UUIDs for idempotent upserts ────────────────────────────────────────
const TENANT_ID       = 'seed-tenant-00000000-0000-0000-0000-000000000001';
const USER_ADMIN_ID   = 'seed-user-000000000-0000-0000-0000-000000000001';
const USER_REC_ID     = 'seed-user-000000000-0000-0000-0000-000000000002';
const USER_HM_ID      = 'seed-user-000000000-0000-0000-0000-000000000003';
const USER_INT_ID     = 'seed-user-000000000-0000-0000-0000-000000000004';
const USER_CO_ID      = 'seed-user-000000000-0000-0000-0000-000000000005';

const pool    = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://postgres:postgres123@localhost:5432/ats_db?schema=public',
});
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as any);

// ── Day helpers ───────────────────────────────────────────────────────────────
const daysFromNow  = (n: number) => new Date(Date.now() + n * 86_400_000);
const daysAgo      = (n: number) => new Date(Date.now() - n * 86_400_000);

// ─────────────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log('🌱 Seeding database…');

  // ── Tenant ─────────────────────────────────────────────────────────────────
  const tenant = await (prisma as any).tenant.upsert({
    where:  { id: TENANT_ID },
    update: {},
    create: {
      id:         TENANT_ID,
      name:       'Acme Corp',
      slug:       'acme',
      dataRegion: 'us-east-1',
      settings:   { theme: 'light', timezone: 'America/New_York', currency: 'USD' },
    },
  });
  console.log('✓ Tenant:', tenant.name);

  // ── Users ──────────────────────────────────────────────────────────────────
  const passwordHash = await hashPassword('Password123!');

  const users = [
    {
      id:         USER_ADMIN_ID,
      email:      'admin@acme.com',
      firstName:  'Alex',
      lastName:   'Administrator',
      role:       'ADMIN',
      department: 'HR',
    },
    {
      id:         USER_REC_ID,
      email:      'recruiter@acme.com',
      firstName:  'Sarah',
      lastName:   'Chen',
      role:       'RECRUITER',
      department: 'HR',
    },
    {
      id:         USER_HM_ID,
      email:      'hiring-manager@acme.com',
      firstName:  'James',
      lastName:   'Wilson',
      role:       'HIRING_MANAGER',
      department: 'Engineering',
    },
    {
      id:         USER_INT_ID,
      email:      'interviewer@acme.com',
      firstName:  'Priya',
      lastName:   'Patel',
      role:       'INTERVIEWER',
      department: 'Engineering',
    },
    {
      id:         USER_CO_ID,
      email:      'compliance@acme.com',
      firstName:  'Dana',
      lastName:   'Torres',
      role:       'COMPLIANCE_OFFICER',
      department: 'Legal',
    },
  ];

  await Promise.all(
    users.map((u) =>
      (prisma as any).user.upsert({
        where:  { id: u.id },
        update: {},
        create: { ...u, tenantId: TENANT_ID, passwordHash },
      }),
    ),
  );
  console.log(`✓ Users (${users.length})`);

  // ── Skills ─────────────────────────────────────────────────────────────────
  const skillDefs = [
    { name: 'JavaScript',       category: 'Technical' },
    { name: 'TypeScript',       category: 'Technical' },
    { name: 'React',            category: 'Technical' },
    { name: 'Node.js',          category: 'Technical' },
    { name: 'Python',           category: 'Technical' },
    { name: 'PostgreSQL',       category: 'Technical' },
    { name: 'AWS',              category: 'Technical' },
    { name: 'Docker',           category: 'Technical' },
    { name: 'Kubernetes',       category: 'Technical' },
    { name: 'GraphQL',          category: 'Technical' },
    { name: 'Machine Learning', category: 'Technical' },
    { name: 'SQL',              category: 'Technical' },
    { name: 'Java',             category: 'Technical' },
    { name: 'Go',               category: 'Technical' },
    { name: 'Communication',    category: 'Soft' },
    { name: 'Leadership',       category: 'Soft' },
  ];

  await Promise.all(
    skillDefs.map((s, i) =>
      (prisma as any).skill.upsert({
        where:  { name: s.name },
        update: {},
        create: { id: `skill-${String(i + 1).padStart(3, '0')}`, ...s },
      }),
    ),
  );
  console.log(`✓ Skills (${skillDefs.length})`);

  // ── Requisitions ───────────────────────────────────────────────────────────
  const reqs = [
    {
      id:         'req-acme-001',
      title:      'Senior Full Stack Engineer',
      department: 'Engineering',
      location:   'San Francisco, CA',
      status:     'OPEN',
      priority:   1,
      salaryMin:  140_000,
      salaryMax:  180_000,
    },
    {
      id:         'req-acme-002',
      title:      'ML Engineer — NLP',
      department: 'AI Research',
      location:   'Remote',
      status:     'OPEN',
      priority:   1,
      salaryMin:  150_000,
      salaryMax:  200_000,
    },
    {
      id:         'req-acme-003',
      title:      'DevOps Engineer',
      department: 'Infrastructure',
      location:   'New York, NY',
      status:     'ON_HOLD',
      priority:   2,
      salaryMin:  130_000,
      salaryMax:  165_000,
    },
    {
      id:         'req-acme-004',
      title:      'Product Designer',
      department: 'Design',
      location:   'Austin, TX',
      status:     'OPEN',
      priority:   2,
      salaryMin:  110_000,
      salaryMax:  140_000,
    },
    {
      id:         'req-acme-005',
      title:      'Data Engineer',
      department: 'Data',
      location:   'Remote',
      status:     'FILLED',
      priority:   3,
      salaryMin:  125_000,
      salaryMax:  160_000,
      closedAt:   daysAgo(5),
    },
  ];

  await Promise.all(
    reqs.map((r) =>
      (prisma as any).requisition.upsert({
        where:  { id: r.id },
        update: {},
        create: {
          ...r,
          tenantId:        TENANT_ID,
          salaryCurrency:  'USD',
          recruiterId:     USER_REC_ID,
          hiringManagerId: USER_HM_ID,
          description:     `We are hiring a ${r.title} to join our growing Acme Corp team.`,
          requirements:    ['3+ years experience', 'Strong communication skills', 'Team player'],
          targetStartDate: daysFromNow(45),
          headcount:       r.status === 'FILLED' ? 1 : 2,
        },
      }),
    ),
  );
  console.log(`✓ Requisitions (${reqs.length})`);

  // ── Candidates ─────────────────────────────────────────────────────────────
  const cands = [
    { id: 'can-acme-001', firstName: 'Emily',   lastName: 'Rodriguez',  email: 'emily.r@email.com',   phone: '+1-415-555-0101', location: 'San Francisco, CA', source: 'LinkedIn'  },
    { id: 'can-acme-002', firstName: 'Marcus',  lastName: 'Johnson',    email: 'marcus.j@email.com',  phone: '+1-650-555-0102', location: 'Mountain View, CA', source: 'Referral'  },
    { id: 'can-acme-003', firstName: 'Aisha',   lastName: 'Patel',      email: 'aisha.p@email.com',   phone: '+44-20-5555-0103',location: 'London, UK',        source: 'Indeed'    },
    { id: 'can-acme-004', firstName: 'Kevin',   lastName: 'Lee',        email: 'kevin.l@email.com',   phone: '+1-213-555-0104', location: 'Los Angeles, CA',   source: 'LinkedIn'  },
    { id: 'can-acme-005', firstName: 'Sarah',   lastName: 'Thompson',   email: 'sarah.t@email.com',   phone: '+1-415-555-0105', location: 'San Francisco, CA', source: 'Portfolio' },
    { id: 'can-acme-006', firstName: 'David',   lastName: 'Kim',        email: 'david.k@email.com',   phone: '+1-212-555-0106', location: 'New York, NY',      source: 'LinkedIn'  },
    { id: 'can-acme-007', firstName: 'Fatima',  lastName: 'Al-Hassan',  email: 'fatima.h@email.com',  phone: '+1-503-555-0107', location: 'Remote',            source: 'GitHub'    },
    { id: 'can-acme-008', firstName: 'Carlos',  lastName: 'Mendez',     email: 'carlos.m@email.com',  phone: '+1-416-555-0108', location: 'Toronto, ON',       source: 'Indeed'    },
    { id: 'can-acme-009', firstName: 'Yuki',    lastName: 'Tanaka',     email: 'yuki.t@email.com',    phone: '+1-206-555-0109', location: 'Seattle, WA',       source: 'Referral'  },
    { id: 'can-acme-010', firstName: 'Olivia',  lastName: 'Bennett',    email: 'olivia.b@email.com',  phone: '+1-408-555-0110', location: 'Cupertino, CA',     source: 'LinkedIn'  },
  ];

  await Promise.all(
    cands.map((c) =>
      (prisma as any).candidate.upsert({
        where:  { id: c.id },
        update: {},
        create: {
          ...c,
          tenantId:  TENANT_ID,
          resumeUrl: `https://storage.acme.com/resumes/${c.id}.pdf`,
          tags:      ['2026-Q2'],
        },
      }),
    ),
  );
  console.log(`✓ Candidates (${cands.length})`);

  // ── CandidateApplications ─────────────────────────────────────────────────
  const candApps = [
    { id: 'capp-001', candidateId: 'can-acme-001', requisitionId: 'req-acme-001', stage: 'FINAL_REVIEW', status: 'ACTIVE',    score: 94 },
    { id: 'capp-002', candidateId: 'can-acme-002', requisitionId: 'req-acme-001', stage: 'FINAL_REVIEW', status: 'ACTIVE',    score: 89 },
    { id: 'capp-003', candidateId: 'can-acme-003', requisitionId: 'req-acme-002', stage: 'INTERVIEW',    status: 'ACTIVE',    score: 96 },
    { id: 'capp-004', candidateId: 'can-acme-004', requisitionId: 'req-acme-003', stage: 'PHONE_SCREEN', status: 'ACTIVE',    score: 82 },
    { id: 'capp-005', candidateId: 'can-acme-005', requisitionId: 'req-acme-004', stage: 'INTERVIEW',    status: 'ACTIVE',    score: 91 },
    { id: 'capp-006', candidateId: 'can-acme-006', requisitionId: 'req-acme-001', stage: 'APPLIED',      status: 'ACTIVE',    score: 78 },
    { id: 'capp-007', candidateId: 'can-acme-007', requisitionId: 'req-acme-002', stage: 'SCREENED',     status: 'ACTIVE',    score: 88 },
    { id: 'capp-008', candidateId: 'can-acme-008', requisitionId: 'req-acme-001', stage: 'INTERVIEW',    status: 'REJECTED',  score: 65, rejectionReason: 'Skills mismatch' },
    { id: 'capp-009', candidateId: 'can-acme-009', requisitionId: 'req-acme-003', stage: 'INTERVIEW',    status: 'ACTIVE',    score: 85 },
    { id: 'capp-010', candidateId: 'can-acme-010', requisitionId: 'req-acme-004', stage: 'APPLIED',      status: 'ACTIVE',    score: 79 },
  ];

  await Promise.all(
    candApps.map((a) =>
      (prisma as any).candidateApplication.upsert({
        where:  { id: a.id },
        update: {},
        create: { ...a, tenantId: TENANT_ID, isBlindReview: false, metadata: {} },
      }),
    ),
  );
  console.log(`✓ CandidateApplications (${candApps.length})`);

  // ── Applications (B1 model) ────────────────────────────────────────────────
  const applications = [
    { id: 'app-acme-001', candidateId: 'can-acme-001', requisitionId: 'req-acme-001', stage: 'FINAL_REVIEW', status: 'ACTIVE'   },
    { id: 'app-acme-002', candidateId: 'can-acme-002', requisitionId: 'req-acme-001', stage: 'FINAL_REVIEW', status: 'ACTIVE'   },
    { id: 'app-acme-003', candidateId: 'can-acme-003', requisitionId: 'req-acme-002', stage: 'INTERVIEW',    status: 'ACTIVE'   },
    { id: 'app-acme-004', candidateId: 'can-acme-004', requisitionId: 'req-acme-003', stage: 'PHONE_SCREEN', status: 'ACTIVE'   },
    { id: 'app-acme-005', candidateId: 'can-acme-005', requisitionId: 'req-acme-004', stage: 'INTERVIEW',    status: 'ACTIVE'   },
    { id: 'app-acme-006', candidateId: 'can-acme-006', requisitionId: 'req-acme-001', stage: 'APPLIED',      status: 'ACTIVE'   },
    { id: 'app-acme-007', candidateId: 'can-acme-007', requisitionId: 'req-acme-002', stage: 'SCREENED',     status: 'ACTIVE'   },
    { id: 'app-acme-008', candidateId: 'can-acme-008', requisitionId: 'req-acme-001', stage: 'INTERVIEW',    status: 'REJECTED' },
    { id: 'app-acme-009', candidateId: 'can-acme-009', requisitionId: 'req-acme-003', stage: 'INTERVIEW',    status: 'ACTIVE'   },
    { id: 'app-acme-010', candidateId: 'can-acme-010', requisitionId: 'req-acme-004', stage: 'APPLIED',      status: 'ACTIVE'   },
  ];

  await Promise.all(
    applications.map((a) =>
      (prisma as any).application.upsert({
        where:  { id: a.id },
        update: {},
        create: { ...a, tenantId: TENANT_ID },
      }),
    ),
  );
  console.log(`✓ Applications (${applications.length})`);

  // ── Interviews ─────────────────────────────────────────────────────────────
  const interviews = [
    {
      id:            'int-acme-001',
      candidateId:   'can-acme-002',
      requisitionId: 'req-acme-001',
      applicationId: 'app-acme-002',
      stage:         'FINAL_REVIEW',
      status:        'SCHEDULED',
      scheduledAt:   daysFromNow(2),
      interviewType: 'TECHNICAL',
      type:          'TECHNICAL',
    },
    {
      id:            'int-acme-002',
      candidateId:   'can-acme-003',
      requisitionId: 'req-acme-002',
      applicationId: 'app-acme-003',
      stage:         'INTERVIEW',
      status:        'SCHEDULED',
      scheduledAt:   daysFromNow(3),
      interviewType: 'PANEL',
      type:          'PANEL',
    },
    {
      id:            'int-acme-003',
      candidateId:   'can-acme-005',
      requisitionId: 'req-acme-004',
      applicationId: 'app-acme-005',
      stage:         'INTERVIEW',
      status:        'COMPLETED',
      scheduledAt:   daysAgo(1),
      interviewType: 'BEHAVIORAL',
      type:          'BEHAVIORAL',
    },
    {
      id:            'int-acme-004',
      candidateId:   'can-acme-009',
      requisitionId: 'req-acme-003',
      applicationId: 'app-acme-009',
      stage:         'INTERVIEW',
      status:        'SCHEDULED',
      scheduledAt:   daysFromNow(4),
      interviewType: 'TECHNICAL',
      type:          'TECHNICAL',
    },
    {
      id:            'int-acme-005',
      candidateId:   'can-acme-001',
      requisitionId: 'req-acme-001',
      applicationId: 'app-acme-001',
      stage:         'FINAL_REVIEW',
      status:        'COMPLETED',
      scheduledAt:   daysAgo(3),
      interviewType: 'FINAL',
      type:          'FINAL',
    },
  ];

  await Promise.all(
    interviews.map((i) =>
      (prisma as any).interview.upsert({
        where:  { id: i.id },
        update: {},
        create: {
          ...i,
          tenantId:   TENANT_ID,
          duration:   60,
          location:   'Google Meet',
          meetingUrl: `https://meet.google.com/acme-${i.id}`,
        },
      }),
    ),
  );
  console.log(`✓ Interviews (${interviews.length})`);

  // ── ScheduleEvents ─────────────────────────────────────────────────────────
  const scheduleEvents = [
    {
      id:           'sevt-acme-001',
      title:        'Technical Interview — Emily Rodriguez',
      description:  'Senior Full Stack Engineer final round interview',
      startAt:      daysFromNow(2),
      endAt:        new Date(daysFromNow(2).getTime() + 60 * 60_000),
      location:     'Google Meet',
      meetingLink:  'https://meet.google.com/acme-int-001',
      attendeeIds:  [USER_INT_ID, USER_HM_ID],
      organizerId:  USER_REC_ID,
      resourceType: 'Interview',
      resourceId:   'int-acme-001',
    },
    {
      id:           'sevt-acme-002',
      title:        'Panel Interview — Aisha Patel',
      description:  'ML Engineer NLP role — panel round',
      startAt:      daysFromNow(3),
      endAt:        new Date(daysFromNow(3).getTime() + 90 * 60_000),
      location:     'Zoom',
      meetingLink:  'https://zoom.us/j/acme-int-002',
      attendeeIds:  [USER_INT_ID, USER_HM_ID, USER_ADMIN_ID],
      organizerId:  USER_REC_ID,
      resourceType: 'Interview',
      resourceId:   'int-acme-002',
    },
    {
      id:           'sevt-acme-003',
      title:        'Recruiting Weekly Sync',
      description:  'Weekly pipeline review — all open reqs',
      startAt:      daysFromNow(1),
      endAt:        new Date(daysFromNow(1).getTime() + 60 * 60_000),
      location:     'Conference Room A',
      meetingLink:  null,
      attendeeIds:  [USER_ADMIN_ID, USER_REC_ID, USER_HM_ID],
      organizerId:  USER_ADMIN_ID,
      resourceType: null,
      resourceId:   null,
    },
    {
      id:           'sevt-acme-004',
      title:        'Technical Interview — Kevin Lee',
      description:  'DevOps Engineer phone screen follow-up',
      startAt:      daysFromNow(4),
      endAt:        new Date(daysFromNow(4).getTime() + 45 * 60_000),
      location:     'Google Meet',
      meetingLink:  'https://meet.google.com/acme-int-004',
      attendeeIds:  [USER_INT_ID],
      organizerId:  USER_REC_ID,
      resourceType: 'Interview',
      resourceId:   'int-acme-004',
    },
    {
      id:           'sevt-acme-005',
      title:        'Offer Discussion — Emily Rodriguez',
      description:  'Comp discussion before extending formal offer',
      startAt:      daysFromNow(5),
      endAt:        new Date(daysFromNow(5).getTime() + 30 * 60_000),
      location:     'Phone',
      meetingLink:  null,
      attendeeIds:  [USER_ADMIN_ID, USER_REC_ID],
      organizerId:  USER_ADMIN_ID,
      resourceType: 'Candidate',
      resourceId:   'can-acme-001',
    },
  ];

  await Promise.all(
    scheduleEvents.map((e) =>
      (prisma as any).scheduleEvent.upsert({
        where:  { id: e.id },
        update: {},
        create: { ...e, tenantId: TENANT_ID },
      }),
    ),
  );
  console.log(`✓ ScheduleEvents (${scheduleEvents.length})`);

  // ── AI Models ──────────────────────────────────────────────────────────────
  const aiModels = [
    { id: 'model-acme-001', name: 'Resume Scorer',    provider: 'internal', version: 'v3.8', status: 'DEPLOYED',    riskTier: 'LOW'    },
    { id: 'model-acme-002', name: 'Skills Matcher',   provider: 'internal', version: 'v2.2', status: 'DEPLOYED',    riskTier: 'LOW'    },
    { id: 'model-acme-003', name: 'Candidate Ranker', provider: 'internal', version: 'v1.4', status: 'DEPLOYED',    riskTier: 'MEDIUM' },
    { id: 'model-acme-004', name: 'Bias Detector',    provider: 'internal', version: 'v2.0', status: 'DEPLOYED',    riskTier: 'HIGH'   },
    { id: 'model-acme-005', name: 'JD Generator',     provider: 'openai',   version: 'v1.1', status: 'SHADOW_EVAL', riskTier: 'LOW'    },
  ];

  await Promise.all(
    aiModels.map((m) =>
      (prisma as any).aIModel.upsert({
        where:  { id: m.id },
        update: {},
        create: {
          ...m,
          tenantId:   TENANT_ID,
          modelCard:  { description: `${m.name} model card`, accuracy: 0.93, metrics: {} },
          config:     { threshold: 0.75, version: m.version },
          approvedBy: USER_ADMIN_ID,
          approvedAt: daysAgo(30),
          deployedAt: daysAgo(14),
        },
      }),
    ),
  );
  console.log(`✓ AI Models (${aiModels.length})`);

  // ── Offer ──────────────────────────────────────────────────────────────────
  await (prisma as any).offer.upsert({
    where:  { id: 'offer-acme-001' },
    update: {},
    create: {
      id:             'offer-acme-001',
      tenantId:       TENANT_ID,
      requisitionId:  'req-acme-001',
      candidateId:    'can-acme-001',
      applicationId:  'app-acme-001',
      salaryAmount:   165_000,
      salaryCurrency: 'USD',
      equity:         { percent: '0.05', vestingYears: 4 },
      benefits:       { health: true, dental: true, vision: true, pto: 25 },
      startDate:      daysFromNow(30),
      expiresAt:      daysFromNow(7),
      status:         'SENT',
      complianceCheck: { passed: true, checkedAt: new Date() },
      approvalChain:  [{ approver: USER_ADMIN_ID, approvedAt: new Date(), status: 'APPROVED' }],
      sentAt:         new Date(),
    },
  });
  console.log('✓ Offer (1)');

  // ── HiringDecision ─────────────────────────────────────────────────────────
  await Promise.all([
    (prisma as any).hiringDecision.upsert({
      where:  { id: 'hdec-acme-001' },
      update: {},
      create: {
        id:            'hdec-acme-001',
        tenantId:      TENANT_ID,
        requisitionId: 'req-acme-001',
        candidateId:   'can-acme-001',
        decisionType:  'ADVANCE',
        recommendation:'HIRE',
        confidence:    0.94,
        rationale:     { reasoning: 'Excellent technical skills, strong cultural fit', score: 94 },
        panelConsensus:{ votes: { YES: 3, NO: 0 }, unanimous: true },
        status:        'APPROVED',
        decidedBy:     USER_HM_ID,
        decidedAt:     daysAgo(2),
      },
    }),
    (prisma as any).hiringDecision.upsert({
      where:  { id: 'hdec-acme-002' },
      update: {},
      create: {
        id:            'hdec-acme-002',
        tenantId:      TENANT_ID,
        requisitionId: 'req-acme-001',
        candidateId:   'can-acme-008',
        decisionType:  'REJECT',
        recommendation:'DO_NOT_HIRE',
        confidence:    0.82,
        rationale:     { reasoning: 'Skills did not match requirements for the role', score: 65 },
        panelConsensus:{ votes: { YES: 0, NO: 2 }, unanimous: true },
        status:        'APPROVED',
        decidedBy:     USER_HM_ID,
        decidedAt:     daysAgo(5),
      },
    }),
  ]);
  console.log('✓ HiringDecisions (2)');

  // ── BiasAnalysis ───────────────────────────────────────────────────────────
  await Promise.all([
    (prisma as any).biasAnalysis.upsert({
      where:  { id: 'bias-acme-001' },
      update: {},
      create: {
        id:                 'bias-acme-001',
        tenantId:           TENANT_ID,
        requisitionId:      'req-acme-001',
        analysisType:       'ADVERSE_IMPACT',
        stage:              'SCREENING',
        protectedAttribute: 'gender',
        fourFifthsPass:     true,
        adverseImpactRatio: 0.96,
        severity:           'LOW',
        status:             'ACTIVE',
        findings:           [{ attribute: 'gender', ratio: 0.94, pass: true }],
        selectionRate:      { male: 0.52, female: 0.48 },
      },
    }),
    (prisma as any).biasAnalysis.upsert({
      where:  { id: 'bias-acme-002' },
      update: {},
      create: {
        id:                 'bias-acme-002',
        tenantId:           TENANT_ID,
        requisitionId:      'req-acme-002',
        analysisType:       'FAIRNESS_AUDIT',
        stage:              'INTERVIEW',
        protectedAttribute: 'gender',
        fourFifthsPass:     false,
        adverseImpactRatio: 0.76,
        severity:           'MEDIUM',
        status:             'ACTIVE',
        findings:           [{ attribute: 'gender', ratio: 0.76, pass: false, recommendation: 'Review screening criteria' }],
        selectionRate:      { male: 0.62, female: 0.47 },
      },
    }),
  ]);
  console.log('✓ BiasAnalyses (2)');

  // ── AuditLog (B3 model) ────────────────────────────────────────────────────
  const auditLogs = [
    { id: 'alog-acme-001', actorId: USER_ADMIN_ID, actorRole: 'ADMIN',       action: 'CREATE', resource: 'Tenant',       resourceId: TENANT_ID      },
    { id: 'alog-acme-002', actorId: USER_REC_ID,   actorRole: 'RECRUITER',   action: 'CREATE', resource: 'Candidate',    resourceId: 'can-acme-001' },
    { id: 'alog-acme-003', actorId: USER_ADMIN_ID, actorRole: 'ADMIN',       action: 'APPROVE',resource: 'Offer',        resourceId: 'offer-acme-001'},
  ];

  await Promise.all(
    auditLogs.map((l) =>
      (prisma as any).auditLog.upsert({
        where:  { id: l.id },
        update: {},
        create: {
          ...l,
          tenantId:  TENANT_ID,
          ipAddress: '127.0.0.1',
          userAgent: 'seed-script/1.0',
          changes:   {},
        },
      }),
    ),
  );
  console.log(`✓ AuditLogs (${auditLogs.length})`);

  // ── AuditTrailEntry ────────────────────────────────────────────────────────
  const auditTrail = [
    { id: 'audit-acme-001', action: 'CANDIDATE_CREATED',         resourceType: 'Candidate',    resourceId: 'can-acme-001',   actorId: USER_REC_ID   },
    { id: 'audit-acme-002', action: 'OFFER_EXTENDED',            resourceType: 'Offer',        resourceId: 'offer-acme-001', actorId: USER_ADMIN_ID },
    { id: 'audit-acme-003', action: 'INTERVIEW_SCHEDULED',       resourceType: 'Interview',    resourceId: 'int-acme-001',   actorId: USER_REC_ID   },
    { id: 'audit-acme-004', action: 'BIAS_SCAN_COMPLETED',       resourceType: 'BiasAnalysis', resourceId: 'bias-acme-001',  actorId: null          },
    { id: 'audit-acme-005', action: 'APPLICATION_STAGE_CHANGED', resourceType: 'Application',  resourceId: 'app-acme-002',   actorId: USER_HM_ID    },
    { id: 'audit-acme-006', action: 'MODEL_DEPLOYED',            resourceType: 'AIModel',      resourceId: 'model-acme-001', actorId: USER_ADMIN_ID },
    { id: 'audit-acme-007', action: 'REQUISITION_OPENED',        resourceType: 'Requisition',  resourceId: 'req-acme-001',   actorId: USER_HM_ID    },
  ];

  await Promise.all(
    auditTrail.map((a, i) =>
      (prisma as any).auditTrailEntry.upsert({
        where:  { id: a.id },
        update: {},
        create: {
          ...a,
          tenantId:  TENANT_ID,
          ipAddress: '127.0.0.1',
          metadata:  {},
          createdAt: new Date(Date.now() - i * 3_600_000),
        },
      }),
    ),
  );
  console.log(`✓ AuditTrailEntries (${auditTrail.length})`);

  // ── HumanReviewItem ────────────────────────────────────────────────────────
  const reviewItems = [
    {
      id:           'hri-acme-001',
      reviewType:   'BIAS_FLAG',
      resourceType: 'BiasAnalysis',
      resourceId:   'bias-acme-002',
      riskLevel:    'MEDIUM',
      status:       'PENDING',
      assignedTo:   USER_CO_ID,
      slaDeadline:  daysFromNow(3),
    },
    {
      id:           'hri-acme-002',
      reviewType:   'DECISION_OVERRIDE',
      resourceType: 'HiringDecision',
      resourceId:   'hdec-acme-001',
      riskLevel:    'LOW',
      status:       'IN_REVIEW',
      assignedTo:   USER_ADMIN_ID,
      slaDeadline:  daysFromNow(5),
    },
  ];

  await Promise.all(
    reviewItems.map((r) =>
      (prisma as any).humanReviewItem.upsert({
        where:  { id: r.id },
        update: {},
        create: { ...r, tenantId: TENANT_ID },
      }),
    ),
  );
  console.log(`✓ HumanReviewItems (${reviewItems.length})`);

  // ── BiasReport ─────────────────────────────────────────────────────────────
  await Promise.all([
    (prisma as any).biasReport.upsert({
      where:  { id: 'brep-acme-001' },
      update: {},
      create: {
        id:              'brep-acme-001',
        tenantId:        TENANT_ID,
        requisitionId:   'req-acme-001',
        scope:           'REQUISITION',
        dimensions:      ['gender', 'ethnicity'],
        findings:        { adverseImpact: { gender: 0.96 }, summary: 'Within acceptable thresholds' },
        overallRisk:     'LOW',
        recommendations: ['Continue monitoring throughout hiring process'],
      },
    }),
    (prisma as any).biasReport.upsert({
      where:  { id: 'brep-acme-002' },
      update: {},
      create: {
        id:              'brep-acme-002',
        tenantId:        TENANT_ID,
        requisitionId:   'req-acme-002',
        scope:           'REQUISITION',
        dimensions:      ['gender'],
        findings:        { adverseImpact: { gender: 0.76 }, summary: 'Below 4/5ths threshold for gender' },
        overallRisk:     'MEDIUM',
        recommendations: ['Review AI screening criteria', 'Request human review of rejected female candidates'],
      },
    }),
  ]);
  console.log('✓ BiasReports (2)');

  // ── PipelineStage ──────────────────────────────────────────────────────────
  const pipelineStages = [
    { id: 'pstage-001', name: 'Applied',      order: 1, color: '#94a3b8', isDefault: true  },
    { id: 'pstage-002', name: 'Screened',     order: 2, color: '#60a5fa', isDefault: true  },
    { id: 'pstage-003', name: 'Phone Screen', order: 3, color: '#a78bfa', isDefault: true  },
    { id: 'pstage-004', name: 'Interview',    order: 4, color: '#f59e0b', isDefault: true  },
    { id: 'pstage-005', name: 'Final Review', order: 5, color: '#f97316', isDefault: true  },
    { id: 'pstage-006', name: 'Offer',        order: 6, color: '#22c55e', isDefault: true  },
  ];

  await Promise.all(
    pipelineStages.map((s) =>
      (prisma as any).pipelineStage.upsert({
        where:  { id: s.id },
        update: {},
        create: { ...s, tenantId: TENANT_ID },
      }),
    ),
  );
  console.log(`✓ PipelineStages (${pipelineStages.length})`);

  // ── Pipeline Metrics ───────────────────────────────────────────────────────
  const stages   = ['APPLIED', 'SCREENED', 'PHONE_SCREEN', 'ASSESSMENT', 'INTERVIEW', 'FINAL_REVIEW'];
  const counts   = [10, 8, 6, 5, 4, 2];

  await Promise.all(
    stages.map((stage, i) =>
      (prisma as any).pipelineMetric.upsert({
        where:  { id: `metric-acme-${String(i + 1).padStart(3, '0')}` },
        update: {},
        create: {
          id:            `metric-acme-${String(i + 1).padStart(3, '0')}`,
          tenantId:      TENANT_ID,
          requisitionId: 'req-acme-001',
          stage,
          count:         counts[i],
          avgDaysInStage:3 + i * 2,
          conversionRate:counts[i + 1] != null ? counts[i + 1] / counts[i] : null,
          period:        '2026-04',
        },
      }),
    ),
  );
  console.log(`✓ PipelineMetrics (${stages.length})`);

  // ── Compliance Policies ────────────────────────────────────────────────────
  const policies = [
    {
      id:           'policy-acme-001',
      name:         'GDPR Data Retention',
      policyType:   'DATA_RETENTION',
      jurisdiction: 'EU',
      rules:        { retentionDays: 730, autoDelete: true },
    },
    {
      id:           'policy-acme-002',
      name:         'NYC Local Law 144',
      policyType:   'BIAS_AUDIT',
      jurisdiction: 'NYC',
      rules:        { auditFrequency: 'annual', publicDisclosure: true },
    },
    {
      id:           'policy-acme-003',
      name:         'CCPA Data Rights',
      policyType:   'DATA_RIGHTS',
      jurisdiction: 'CA',
      rules:        { rightToDelete: true, rightToAccess: true, optOutSale: true },
    },
  ];

  await Promise.all(
    policies.map((p) =>
      (prisma as any).compliancePolicy.upsert({
        where:  { id: p.id },
        update: {},
        create: { ...p, tenantId: TENANT_ID, isActive: true, version: 1, approvedBy: USER_ADMIN_ID },
      }),
    ),
  );
  console.log(`✓ Compliance Policies (${policies.length})`);

  // ── Hiring Events ──────────────────────────────────────────────────────────
  const hiringEvents = [
    { id: 'hevt-001', resourceType: 'Requisition', resourceId: 'req-acme-001',   eventType: 'REQUISITION_OPENED',   actorId: USER_HM_ID    },
    { id: 'hevt-002', resourceType: 'Candidate',   resourceId: 'can-acme-001',   eventType: 'CANDIDATE_APPLIED',    actorId: null          },
    { id: 'hevt-003', resourceType: 'Application', resourceId: 'app-acme-001',   eventType: 'STAGE_ADVANCED',       actorId: USER_REC_ID   },
    { id: 'hevt-004', resourceType: 'Interview',   resourceId: 'int-acme-001',   eventType: 'INTERVIEW_SCHEDULED',  actorId: USER_REC_ID   },
    { id: 'hevt-005', resourceType: 'Offer',       resourceId: 'offer-acme-001', eventType: 'OFFER_EXTENDED',       actorId: USER_ADMIN_ID },
  ];

  await Promise.all(
    hiringEvents.map((e, i) =>
      (prisma as any).hiringEvent.upsert({
        where:  { id: e.id },
        update: {},
        create: {
          ...e,
          tenantId:  TENANT_ID,
          data:      { timestamp: new Date(Date.now() - i * 86_400_000) },
          createdAt: new Date(Date.now() - i * 86_400_000),
        },
      }),
    ),
  );
  console.log(`✓ HiringEvents (${hiringEvents.length})`);

  // ── IntegrationConfig ──────────────────────────────────────────────────────
  const integrationCfgs = [
    { id: 'cfg-acme-001', integrationType: 'JOB_BOARD',        provider: 'linkedin'  },
    { id: 'cfg-acme-002', integrationType: 'JOB_BOARD',        provider: 'indeed'    },
    { id: 'cfg-acme-003', integrationType: 'CALENDAR',         provider: 'google'    },
    { id: 'cfg-acme-004', integrationType: 'EMAIL',            provider: 'sendgrid'  },
    { id: 'cfg-acme-005', integrationType: 'BACKGROUND_CHECK', provider: 'checkr'   },
    { id: 'cfg-acme-006', integrationType: 'HRIS',             provider: 'workday'   },
  ];

  await Promise.all(
    integrationCfgs.map((cfg) =>
      (prisma as any).integrationConfig.upsert({
        where:  { id: cfg.id },
        update: {},
        create: { ...cfg, tenantId: TENANT_ID, config: { apiKey: '[configured]' }, status: 'ACTIVE' },
      }),
    ),
  );
  console.log(`✓ IntegrationConfigs (${integrationCfgs.length})`);

  // ── Integration (B4 model) ─────────────────────────────────────────────────
  const integrations = [
    { id: 'int-b4-001', name: 'LinkedIn Jobs',  type: 'JOB_BOARD', status: 'ACTIVE'        },
    { id: 'int-b4-002', name: 'Google Calendar', type: 'CALENDAR',  status: 'ACTIVE'        },
    { id: 'int-b4-003', name: 'Workday HRIS',    type: 'HRIS',      status: 'PENDING_SETUP' },
  ];

  await Promise.all(
    integrations.map((i) =>
      (prisma as any).integration.upsert({
        where:  { id: i.id },
        update: {},
        create: { ...i, tenantId: TENANT_ID },
      }),
    ),
  );
  console.log(`✓ Integrations (${integrations.length})`);

  // ── MobilityCase ───────────────────────────────────────────────────────────
  await (prisma as any).mobilityCase.upsert({
    where:  { id: 'mob-acme-001' },
    update: {},
    create: {
      id:              'mob-acme-001',
      tenantId:        TENANT_ID,
      employeeId:      USER_INT_ID,
      currentRole:     'Software Engineer II',
      targetRole:      'Senior Software Engineer',
      currentLocation: 'New York, NY',
      targetLocation:  'San Francisco, CA',
      status:          'UNDER_REVIEW',
      reason:          'Promotion and relocation request',
      notes:           'High performer, excellent reviews for 2 years',
    },
  });
  console.log('✓ MobilityCases (1)');

  // ── OnboardingHandoff ──────────────────────────────────────────────────────
  await (prisma as any).onboardingHandoff.upsert({
    where:  { id: 'onb-acme-001' },
    update: {},
    create: {
      id:             'onb-acme-001',
      tenantId:       TENANT_ID,
      candidateId:    'can-acme-001',
      requisitionId:  'req-acme-001',
      hiringContext:  { role: 'Senior Full Stack Engineer', level: 'Senior', team: 'Platform', startDate: daysFromNow(30) },
      interviewNotes: [{ round: 'Technical', feedback: 'Outstanding', interviewer: USER_INT_ID }],
      assessmentData: { score: 94, percentile: 95 },
      assignedTo:     USER_ADMIN_ID,
      status:         'PENDING',
    },
  });
  console.log('✓ OnboardingHandoff (1)');

  // ── OnboardingTask ─────────────────────────────────────────────────────────
  const onboardingTasks = [
    { id: 'otask-001', title: 'Send welcome email',        taskType: 'COMMUNICATION', dueDate: daysFromNow(1)  },
    { id: 'otask-002', title: 'Provision laptop & access', taskType: 'IT_SETUP',      dueDate: daysFromNow(3)  },
    { id: 'otask-003', title: 'Schedule Day 1 orientation',taskType: 'SCHEDULING',    dueDate: daysFromNow(5)  },
  ];

  await Promise.all(
    onboardingTasks.map((t) =>
      (prisma as any).onboardingTask.upsert({
        where:  { id: t.id },
        update: {},
        create: {
          ...t,
          tenantId:   TENANT_ID,
          handoffId:  'onb-acme-001',
          assignedTo: USER_ADMIN_ID,
          status:     'PENDING',
        },
      }),
    ),
  );
  console.log(`✓ OnboardingTasks (${onboardingTasks.length})`);

  // ── AIJob ──────────────────────────────────────────────────────────────────
  const aiJobs = [
    {
      id:      'aijob-acme-001',
      type:    'RESUME_PARSE',
      status:  'COMPLETED',
      input:   { candidateId: 'can-acme-001', resumeUrl: 'https://storage.acme.com/resumes/can-acme-001.pdf' },
      output:  { skills: ['TypeScript', 'React', 'Node.js'], experience: 6, education: 'BS Computer Science' },
      modelId: 'model-acme-001',
      startedAt:   daysAgo(2),
      completedAt: daysAgo(2),
    },
    {
      id:      'aijob-acme-002',
      type:    'CANDIDATE_MATCH',
      status:  'COMPLETED',
      input:   { candidateId: 'can-acme-003', requisitionId: 'req-acme-002' },
      output:  { score: 96, matchedSkills: ['Python', 'Machine Learning', 'NLP'], gaps: [] },
      modelId: 'model-acme-002',
      startedAt:   daysAgo(1),
      completedAt: daysAgo(1),
    },
    {
      id:      'aijob-acme-003',
      type:    'BIAS_CHECK',
      status:  'COMPLETED',
      input:   { requisitionId: 'req-acme-002', stage: 'SCREENING' },
      output:  { riskLevel: 'MEDIUM', adverseImpactRatio: 0.76, flagged: true },
      modelId: 'model-acme-004',
      startedAt:   daysAgo(1),
      completedAt: daysAgo(1),
    },
  ];

  await Promise.all(
    aiJobs.map((j) =>
      (prisma as any).aIJob.upsert({
        where:  { id: j.id },
        update: {},
        create: { ...j, tenantId: TENANT_ID },
      }),
    ),
  );
  console.log(`✓ AIJobs (${aiJobs.length})`);

  // ── Schedule Slots ─────────────────────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const slotDate = daysFromNow(i + 1);
    await (prisma as any).scheduleSlot
      .upsert({
        where:  { id: `slot-acme-${String(i + 1).padStart(3, '0')}` },
        update: {},
        create: {
          id:          `slot-acme-${String(i + 1).padStart(3, '0')}`,
          tenantId:    TENANT_ID,
          userId:      i % 2 === 0 ? USER_INT_ID : USER_HM_ID,
          date:        slotDate,
          startTime:   '09:00',
          endTime:     '10:00',
          timezone:    'America/New_York',
          isAvailable: i % 3 !== 0,
          isBooked:    false,
        },
      })
      .catch(() => null);
  }
  console.log('✓ ScheduleSlots (8)');

  // ── Candidate Notes ────────────────────────────────────────────────────────
  const notes = [
    { id: 'note-acme-001', candidateId: 'can-acme-001', authorId: USER_REC_ID,  content: 'Strong technical background, excellent communication skills. Top candidate.', isPrivate: false },
    { id: 'note-acme-002', candidateId: 'can-acme-002', authorId: USER_HM_ID,   content: 'Very promising candidate. Schedule final round ASAP.', isPrivate: false },
    { id: 'note-acme-003', candidateId: 'can-acme-003', authorId: USER_INT_ID,  content: 'Outstanding ML experience. Recommend strong hire.', isPrivate: false },
    { id: 'note-acme-004', candidateId: 'can-acme-008', authorId: USER_REC_ID,  content: 'Skills gap in required areas noted during technical screen.', isPrivate: true  },
  ];

  await Promise.all(
    notes.map((n) =>
      (prisma as any).candidateNote.upsert({
        where:  { id: n.id },
        update: {},
        create: { ...n, tenantId: TENANT_ID },
      }),
    ),
  );
  console.log(`✓ CandidateNotes (${notes.length})`);

  // ── InterviewFeedback ──────────────────────────────────────────────────────
  await (prisma as any).interviewFeedback.upsert({
    where:  { id: 'ifb-acme-001' },
    update: {},
    create: {
      id:                 'ifb-acme-001',
      interviewId:        'int-acme-003',
      interviewerId:      USER_INT_ID,
      candidateId:        'can-acme-005',
      overallRating:      4,
      strengths:          ['Strong design portfolio', 'Excellent UX thinking', 'Clear communication'],
      concerns:           ['Limited experience with complex design systems'],
      recommendation:     'YES',
      recommendationEnum: 'YES',
      notes:              'Strong candidate, recommend advancing to offer stage.',
      signals:            [{ type: 'cultural_fit', score: 4 }, { type: 'technical_skill', score: 4 }],
    },
  });

  await (prisma as any).interviewFeedback.upsert({
    where:  { id: 'ifb-acme-002' },
    update: {},
    create: {
      id:                 'ifb-acme-002',
      interviewId:        'int-acme-005',
      interviewerId:      USER_HM_ID,
      candidateId:        'can-acme-001',
      overallRating:      5,
      strengths:          ['Exceptional TypeScript skills', 'System design expertise', 'Leadership potential'],
      concerns:           [],
      recommendation:     'STRONG_YES',
      recommendationEnum: 'STRONG_YES',
      notes:              'Best candidate I have interviewed this year. Immediate hire.',
      signals:            [{ type: 'technical_skill', score: 5 }, { type: 'leadership', score: 5 }],
    },
  });
  console.log('✓ InterviewFeedback (2)');

  // ── TalentPool ─────────────────────────────────────────────────────────────
  await (prisma as any).talentPool.upsert({
    where:  { id: 'pool-acme-001' },
    update: {},
    create: {
      id:          'pool-acme-001',
      tenantId:    TENANT_ID,
      name:        'Senior Engineers — Pipeline',
      description: 'Pre-qualified senior engineering candidates for future openings',
      criteria:    { minExperience: 5, skills: ['TypeScript', 'React', 'Node.js'], level: 'SENIOR' },
      memberCount: 3,
      isActive:    true,
    },
  });
  console.log('✓ TalentPool (1)');

  // ── Additional Candidates (enriched demo data) ─────────────────────────
  const extraCands = [
    { id: 'seed-cand-0000-0000-0000-000000000011', firstName: 'Alex',  lastName: 'Thompson', email: 'alex.thompson@example.com',  phone: '+1-212-555-0201', location: 'New York, NY',      source: 'LinkedIn' },
    { id: 'seed-cand-0000-0000-0000-000000000012', firstName: 'Priya', lastName: 'Patel',    email: 'priya.patel@example.com',    phone: '+1-415-555-0202', location: 'San Francisco, CA', source: 'Referral' },
    { id: 'seed-cand-0000-0000-0000-000000000013', firstName: 'James', lastName: 'Wilson',   email: 'james.wilson@example.com',   phone: '+1-512-555-0203', location: 'Austin, TX',        source: 'Indeed'   },
    { id: 'seed-cand-0000-0000-0000-000000000014', firstName: 'Maria', lastName: 'Garcia',   email: 'maria.garcia@example.com',   phone: '+1-312-555-0204', location: 'Chicago, IL',       source: 'LinkedIn' },
    { id: 'seed-cand-0000-0000-0000-000000000015', firstName: 'Chen',  lastName: 'Wei',      email: 'chen.wei@example.com',       phone: '+1-206-555-0205', location: 'Seattle, WA',       source: 'Direct'   },
  ];

  await Promise.all(
    extraCands.map((c) =>
      (prisma as any).candidate.upsert({
        where:  { id: c.id },
        update: {},
        create: {
          ...c,
          tenantId:  TENANT_ID,
          resumeUrl: `https://storage.acme.com/resumes/${c.id}.pdf`,
          tags:      ['2026-Q2', 'enriched-demo'],
        },
      }),
    ),
  );
  console.log(`✓ Extra Candidates (${extraCands.length})`);

  // ── Additional CandidateApplications (cover all pipeline stages) ──────
  const extraApps = [
    { id: 'capp-011', candidateId: 'seed-cand-0000-0000-0000-000000000011', requisitionId: 'req-acme-001', stage: 'SCREENED',  status: 'ACTIVE', score: 81 },
    { id: 'capp-012', candidateId: 'seed-cand-0000-0000-0000-000000000012', requisitionId: 'req-acme-002', stage: 'OFFER',     status: 'ACTIVE', score: 93 },
    { id: 'capp-013', candidateId: 'seed-cand-0000-0000-0000-000000000013', requisitionId: 'req-acme-003', stage: 'HIRED',     status: 'HIRED',  score: 90 },
    { id: 'capp-014', candidateId: 'seed-cand-0000-0000-0000-000000000014', requisitionId: 'req-acme-004', stage: 'INTERVIEW', status: 'ACTIVE', score: 87 },
    { id: 'capp-015', candidateId: 'seed-cand-0000-0000-0000-000000000015', requisitionId: 'req-acme-005', stage: 'APPLIED',   status: 'ACTIVE', score: 74 },
  ];

  await Promise.all(
    extraApps.map((a) =>
      (prisma as any).candidateApplication.upsert({
        where:  { id: a.id },
        update: {},
        create: { ...a, tenantId: TENANT_ID, isBlindReview: false, metadata: {} },
      }),
    ),
  );
  console.log(`✓ Extra CandidateApplications (${extraApps.length})`);

  // ── Additional Applications (B1 model mirrors) ────────────────────────
  const extraApplicationsB1 = [
    { id: 'app-acme-011', candidateId: 'seed-cand-0000-0000-0000-000000000011', requisitionId: 'req-acme-001', stage: 'SCREENED',  status: 'ACTIVE' },
    { id: 'app-acme-012', candidateId: 'seed-cand-0000-0000-0000-000000000012', requisitionId: 'req-acme-002', stage: 'OFFER',     status: 'ACTIVE' },
    { id: 'app-acme-013', candidateId: 'seed-cand-0000-0000-0000-000000000013', requisitionId: 'req-acme-003', stage: 'HIRED',     status: 'HIRED'  },
    { id: 'app-acme-014', candidateId: 'seed-cand-0000-0000-0000-000000000014', requisitionId: 'req-acme-004', stage: 'INTERVIEW', status: 'ACTIVE' },
    { id: 'app-acme-015', candidateId: 'seed-cand-0000-0000-0000-000000000015', requisitionId: 'req-acme-005', stage: 'APPLIED',   status: 'ACTIVE' },
  ];

  await Promise.all(
    extraApplicationsB1.map((a) =>
      (prisma as any).application.upsert({
        where:  { id: a.id },
        update: {},
        create: { ...a, tenantId: TENANT_ID },
      }),
    ),
  );
  console.log(`✓ Extra Applications B1 (${extraApplicationsB1.length})`);

  // ── Additional HiringEvents (10 events, diverse types, last 30 days) ──
  const extraHiringEvents = [
    { id: 'hevt-011', resourceType: 'Candidate',   resourceId: 'seed-cand-0000-0000-0000-000000000011', eventType: 'APPLICATION_RECEIVED', actorId: null,          daysBack: 28 },
    { id: 'hevt-012', resourceType: 'Candidate',   resourceId: 'seed-cand-0000-0000-0000-000000000012', eventType: 'APPLICATION_RECEIVED', actorId: null,          daysBack: 25 },
    { id: 'hevt-013', resourceType: 'Candidate',   resourceId: 'seed-cand-0000-0000-0000-000000000013', eventType: 'APPLICATION_RECEIVED', actorId: null,          daysBack: 22 },
    { id: 'hevt-014', resourceType: 'Interview',   resourceId: 'int-acme-002',                          eventType: 'INTERVIEW_SCHEDULED',  actorId: USER_REC_ID,   daysBack: 18 },
    { id: 'hevt-015', resourceType: 'Interview',   resourceId: 'int-acme-003',                          eventType: 'INTERVIEW_SCHEDULED',  actorId: USER_REC_ID,   daysBack: 14 },
    { id: 'hevt-016', resourceType: 'Offer',       resourceId: 'offer-acme-001',                        eventType: 'OFFER_EXTENDED',       actorId: USER_ADMIN_ID, daysBack: 10 },
    { id: 'hevt-017', resourceType: 'Candidate',   resourceId: 'seed-cand-0000-0000-0000-000000000012', eventType: 'OFFER_EXTENDED',       actorId: USER_REC_ID,   daysBack: 7  },
    { id: 'hevt-018', resourceType: 'Candidate',   resourceId: 'can-acme-001',                          eventType: 'OFFER_ACCEPTED',       actorId: null,          daysBack: 5  },
    { id: 'hevt-019', resourceType: 'Requisition', resourceId: 'req-acme-004',                          eventType: 'REQUISITION_OPENED',   actorId: USER_HM_ID,    daysBack: 3  },
    { id: 'hevt-020', resourceType: 'Candidate',   resourceId: 'seed-cand-0000-0000-0000-000000000013', eventType: 'HIRE_COMPLETED',       actorId: USER_ADMIN_ID, daysBack: 1  },
  ];

  await Promise.all(
    extraHiringEvents.map((e) =>
      (prisma as any).hiringEvent.upsert({
        where:  { id: e.id },
        update: {},
        create: {
          id:           e.id,
          tenantId:     TENANT_ID,
          eventType:    e.eventType,
          resourceType: e.resourceType,
          resourceId:   e.resourceId,
          actorId:      e.actorId,
          data:         { timestamp: daysAgo(e.daysBack).toISOString() },
          createdAt:    daysAgo(e.daysBack),
        },
      }),
    ),
  );
  console.log(`✓ Extra HiringEvents (${extraHiringEvents.length})`);

  // ── Additional AuditTrailEntries (5 diverse actions) ──────────────────
  const extraAudit = [
    { id: 'audit-acme-011', action: 'CANDIDATE_CREATED',              resourceType: 'Candidate',    resourceId: 'seed-cand-0000-0000-0000-000000000011', actorId: USER_REC_ID,   daysBack: 27 },
    { id: 'audit-acme-012', action: 'REQUISITION_APPROVED',           resourceType: 'Requisition',  resourceId: 'req-acme-004',                          actorId: USER_ADMIN_ID, daysBack: 20 },
    { id: 'audit-acme-013', action: 'INTERVIEW_FEEDBACK_SUBMITTED',   resourceType: 'Interview',    resourceId: 'int-acme-003',                          actorId: USER_INT_ID,   daysBack: 12 },
    { id: 'audit-acme-014', action: 'OFFER_SENT',                     resourceType: 'Offer',        resourceId: 'offer-acme-001',                        actorId: USER_ADMIN_ID, daysBack: 8  },
    { id: 'audit-acme-015', action: 'COMPLIANCE_CHECK_RUN',           resourceType: 'Requisition',  resourceId: 'req-acme-001',                          actorId: null,          daysBack: 4  },
  ];

  await Promise.all(
    extraAudit.map((a) =>
      (prisma as any).auditTrailEntry.upsert({
        where:  { id: a.id },
        update: {},
        create: {
          id:           a.id,
          tenantId:     TENANT_ID,
          actorId:      a.actorId,
          action:       a.action,
          resourceType: a.resourceType,
          resourceId:   a.resourceId,
          ipAddress:    '127.0.0.1',
          metadata:     {},
          createdAt:    daysAgo(a.daysBack),
        },
      }),
    ),
  );
  console.log(`✓ Extra AuditTrailEntries (${extraAudit.length})`);

  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!');
  console.log('   Tenant : Acme Corp (slug: acme)');
  console.log('   Credentials — password: Password123!');
  console.log('   admin@acme.com            — ADMIN');
  console.log('   recruiter@acme.com        — RECRUITER');
  console.log('   hiring-manager@acme.com   — HIRING_MANAGER');
  console.log('   interviewer@acme.com      — INTERVIEWER');
  console.log('   compliance@acme.com       — COMPLIANCE_OFFICER');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
