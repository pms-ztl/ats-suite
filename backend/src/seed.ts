import 'dotenv/config';
import prisma from './utils/prisma';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-corp' },
    update: {},
    create: {
      id: 'dev-tenant-001',
      name: 'Demo Corporation',
      slug: 'demo-corp',
      dataRegion: 'us-east-1',
      settings: { timezone: 'America/New_York', defaultCurrency: 'USD' },
    },
  });

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = [
    { id: 'dev-user-001', email: 'admin@demo.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN' as const },
    { id: 'dev-user-002', email: 'recruiter@demo.com', firstName: 'Sarah', lastName: 'Miller', role: 'RECRUITER' as const },
    { id: 'dev-user-003', email: 'hm@demo.com', firstName: 'John', lastName: 'Davis', role: 'HIRING_MANAGER' as const },
    { id: 'dev-user-004', email: 'compliance@demo.com', firstName: 'Lisa', lastName: 'Chen', role: 'COMPLIANCE_OFFICER' as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
      update: {},
      create: { ...u, tenantId: tenant.id, passwordHash },
    });
  }

  // Create skills
  const skills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust',
    'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
    'Machine Learning', 'Data Science', 'Project Management',
    'Communication', 'Leadership', 'Problem Solving',
  ];
  for (const name of skills) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name, category: name.match(/Communication|Leadership|Problem/) ? 'Soft Skills' : 'Technical' },
    });
  }

  // Create requisitions
  const requisitions = [
    { title: 'Senior Software Engineer', department: 'Engineering', location: 'New York, NY', country: 'US', status: 'OPEN' as const, salaryMin: 150000, salaryMax: 200000 },
    { title: 'Product Manager', department: 'Product', location: 'San Francisco, CA', country: 'US', status: 'OPEN' as const, salaryMin: 140000, salaryMax: 180000 },
    { title: 'Data Scientist', department: 'Data', location: 'Remote', country: 'US', status: 'OPEN' as const, salaryMin: 130000, salaryMax: 170000 },
    { title: 'UX Designer', department: 'Design', location: 'London, UK', country: 'GB', status: 'OPEN' as const, salaryMin: 80000, salaryMax: 110000 },
    { title: 'DevOps Engineer', department: 'Engineering', location: 'Berlin, DE', country: 'DE', status: 'DRAFT' as const, salaryMin: 75000, salaryMax: 100000 },
  ];

  for (const req of requisitions) {
    await prisma.requisition.create({
      data: { ...req, tenantId: tenant.id, recruiterId: 'dev-user-002', salaryCurrency: req.country === 'GB' ? 'GBP' : req.country === 'DE' ? 'EUR' : 'USD' },
    });
  }

  // Create candidates
  const candidates = [
    { email: 'alice@example.com', firstName: 'Alice', lastName: 'Johnson', location: 'New York', source: 'LinkedIn' },
    { email: 'bob@example.com', firstName: 'Bob', lastName: 'Smith', location: 'San Francisco', source: 'Referral' },
    { email: 'carol@example.com', firstName: 'Carol', lastName: 'Williams', location: 'Chicago', source: 'Job Board' },
    { email: 'david@example.com', firstName: 'David', lastName: 'Brown', location: 'Austin', source: 'Direct' },
    { email: 'eve@example.com', firstName: 'Eve', lastName: 'Davis', location: 'Seattle', source: 'LinkedIn' },
    { email: 'frank@example.com', firstName: 'Frank', lastName: 'Garcia', location: 'Boston', source: 'Career Fair' },
    { email: 'grace@example.com', firstName: 'Grace', lastName: 'Martinez', location: 'Denver', source: 'Referral' },
    { email: 'henry@example.com', firstName: 'Henry', lastName: 'Anderson', location: 'Portland', source: 'Job Board' },
    { email: 'iris@example.com', firstName: 'Iris', lastName: 'Thomas', location: 'Miami', source: 'LinkedIn' },
    { email: 'jack@example.com', firstName: 'Jack', lastName: 'Taylor', location: 'Dallas', source: 'Direct' },
  ];

  for (const c of candidates) {
    await prisma.candidate.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: c.email } },
      update: {},
      create: { ...c, tenantId: tenant.id, country: 'US' },
    });
  }

  // Create AI Models
  await prisma.aIModel.create({
    data: {
      tenantId: tenant.id,
      name: 'CandidateRanker-v3',
      provider: 'Anthropic Claude',
      version: '3.0.1',
      status: 'DEPLOYED',
      riskTier: 'HIGH',
      modelCard: { purpose: 'Rank candidates by job fit', limitations: ['May not capture niche skills'], fairnessMetrics: { genderParity: 0.95 } },
    },
  });

  await prisma.aIModel.create({
    data: {
      tenantId: tenant.id,
      name: 'BiasDetector-v2',
      provider: 'Internal',
      version: '2.1.0',
      status: 'DEPLOYED',
      riskTier: 'MEDIUM',
      modelCard: { purpose: 'Detect bias in hiring decisions', accuracy: 0.94 },
    },
  });

  // Create compensation benchmarks
  const benchmarks = [
    { jobFamily: 'Engineering', level: 'Senior', location: 'US', percentile25: 140000, percentile50: 165000, percentile75: 190000, percentile90: 220000 },
    { jobFamily: 'Engineering', level: 'Mid', location: 'US', percentile25: 100000, percentile50: 125000, percentile75: 150000, percentile90: 175000 },
    { jobFamily: 'Product', level: 'Senior', location: 'US', percentile25: 135000, percentile50: 155000, percentile75: 180000, percentile90: 210000 },
    { jobFamily: 'Data', level: 'Senior', location: 'US', percentile25: 130000, percentile50: 150000, percentile75: 175000, percentile90: 200000 },
  ];

  for (const b of benchmarks) {
    await prisma.compensationBenchmark.create({
      data: { ...b, tenantId: tenant.id, currency: 'USD', validUntil: new Date('2027-01-01') },
    });
  }

  console.log('Seed completed successfully!');
  console.log(`  Tenant: ${tenant.name} (${tenant.id})`);
  console.log(`  Users: ${users.length}`);
  console.log(`  Skills: ${skills.length}`);
  console.log(`  Requisitions: ${requisitions.length}`);
  console.log(`  Candidates: ${candidates.length}`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
