import { describe, it, expect } from 'vitest';
import { ParsedResumeSchema } from '../agents/resume-parser';

describe('Resume Parser Agent', () => {
  describe('ParsedResumeSchema', () => {
    it('validates a complete parsed resume', () => {
      const valid = {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        summary: 'Senior software engineer with 8 years of experience.',
        totalYearsExperience: 8,
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        experience: [{
          company: 'TechCorp',
          title: 'Senior Engineer',
          startDate: '2020-01',
          endDate: null,
          description: 'Led platform team.',
        }],
        education: [{
          institution: 'MIT',
          degree: 'MS',
          field: 'Computer Science',
          year: 2016,
        }],
      };
      expect(ParsedResumeSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects resume with missing required fields', () => {
      expect(ParsedResumeSchema.safeParse({}).success).toBe(false);
    });

    it('rejects resume with empty skills', () => {
      const invalid = {
        name: 'Test',
        summary: 'Test',
        totalYearsExperience: 0,
        skills: [],
        experience: [],
        education: [],
      };
      expect(ParsedResumeSchema.safeParse(invalid).success).toBe(false);
    });

    it('accepts resume with minimal fields', () => {
      const minimal = {
        name: 'Jane Doe',
        summary: 'Entry-level developer.',
        totalYearsExperience: 0,
        skills: ['Python'],
        experience: [],
        education: [],
      };
      expect(ParsedResumeSchema.safeParse(minimal).success).toBe(true);
    });

    it('validates experience entries with null endDate for current positions', () => {
      const withCurrent = {
        name: 'John Smith',
        summary: 'Currently employed software developer.',
        totalYearsExperience: 5,
        skills: ['Java'],
        experience: [{
          company: 'Acme Inc',
          title: 'Developer',
          startDate: '2021-03',
          endDate: null,
          description: 'Building microservices.',
        }],
        education: [],
      };
      expect(ParsedResumeSchema.safeParse(withCurrent).success).toBe(true);
    });

    it('validates education entries with null graduation year', () => {
      const withNullYear = {
        name: 'Alice Wong',
        summary: 'Pursuing degree.',
        totalYearsExperience: 0,
        skills: ['Research'],
        experience: [],
        education: [{
          institution: 'Stanford University',
          degree: 'PhD',
          field: 'Machine Learning',
          year: null,
        }],
      };
      expect(ParsedResumeSchema.safeParse(withNullYear).success).toBe(true);
    });

    it('validates optional certifications and languages', () => {
      const withOptionals = {
        name: 'Bob Jones',
        summary: 'Certified professional.',
        totalYearsExperience: 3,
        skills: ['AWS', 'Docker'],
        experience: [],
        education: [],
        certifications: ['AWS Solutions Architect', 'CKA'],
        languages: ['English', 'Spanish'],
      };
      expect(ParsedResumeSchema.safeParse(withOptionals).success).toBe(true);
    });

    it('rejects negative totalYearsExperience', () => {
      const negative = {
        name: 'Test',
        summary: 'Test',
        totalYearsExperience: -1,
        skills: ['Skill'],
        experience: [],
        education: [],
      };
      expect(ParsedResumeSchema.safeParse(negative).success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const badEmail = {
        name: 'Test',
        email: 'not-an-email',
        summary: 'Test',
        totalYearsExperience: 0,
        skills: ['Skill'],
        experience: [],
        education: [],
      };
      expect(ParsedResumeSchema.safeParse(badEmail).success).toBe(false);
    });
  });

  describe('parseResume function', () => {
    it('exports parseResume as a function', async () => {
      const { parseResume } = await import('../agents/resume-parser');
      expect(typeof parseResume).toBe('function');
    });
  });
});
