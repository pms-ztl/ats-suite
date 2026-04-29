import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ATS API',
      version: '1.0.0',
      description: 'AI-Powered Applicant Tracking System API',
    },
    servers: [
      { url: 'http://localhost:4000/api', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'ats-token',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
        Candidate: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tenantId: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED', 'BLACKLISTED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Requisition: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tenantId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            department: { type: 'string' },
            status: { type: 'string', enum: ['DRAFT', 'OPEN', 'ON_HOLD', 'FILLED', 'CANCELLED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Interview: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tenantId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] },
            scheduledAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/agents/runs': {
        get: {
          summary: 'List agent runs',
          tags: ['Agents'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Array of agent run records' } },
        },
      },
      '/api/agents/hitl': {
        get: {
          summary: 'List pending HITL checkpoints',
          tags: ['Agents'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Array of HITL checkpoint items' } },
        },
      },
      '/api/resume/upload': {
        post: {
          summary: 'Upload and process a resume',
          tags: ['Resume'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } },
          },
          responses: { '201': { description: 'Resume uploaded and queued for parsing' } },
        },
      },
      '/api/resume/parse': {
        post: {
          summary: 'AI-parse an uploaded resume',
          tags: ['Resume'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Parsed resume structured data' } },
        },
      },
      '/api/screening/ai-screen': {
        post: {
          summary: 'AI-screen a candidate',
          tags: ['Screening'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { candidateId: { type: 'string' }, requisitionId: { type: 'string' } } } } },
          },
          responses: { '200': { description: 'Screening result with scored dimensions' } },
        },
      },
      '/api/requisitions/ai-draft': {
        post: {
          summary: 'AI-generate a job description',
          tags: ['Requisitions'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Generated job description draft' } },
        },
      },
      '/api/scheduling/ai-schedule': {
        post: {
          summary: 'AI-propose interview slots',
          tags: ['Scheduling'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Proposed interview time slots' } },
        },
      },
      '/api/candidate-chat/message': {
        post: {
          summary: 'Chat with candidate assistant',
          tags: ['Candidate'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } },
          },
          responses: { '200': { description: 'Assistant reply' } },
        },
      },
      '/api/compliance/gdpr/access': {
        post: {
          summary: 'GDPR data access request',
          tags: ['Compliance'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Data access package' } },
        },
      },
      '/api/compliance/gdpr/erase': {
        post: {
          summary: 'GDPR data erasure',
          tags: ['Compliance'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Erasure confirmation' } },
        },
      },
      '/api/compliance/adverse-impact': {
        post: {
          summary: 'EEOC adverse impact analysis',
          tags: ['Compliance'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Adverse impact report with four-fifths rule results' } },
        },
      },
      '/api/compliance/report': {
        get: {
          summary: 'Generate compliance report',
          tags: ['Compliance'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Full compliance report' } },
        },
      },
      '/api/billing/usage': {
        get: {
          summary: 'Tenant cost usage',
          tags: ['Billing'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Cost usage breakdown by agent type' } },
        },
      },
      '/api/billing/budget': {
        get: {
          summary: 'Check budget status',
          tags: ['Billing'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Budget ceiling and current spend' } },
        },
      },
      '/api/observability/slos': {
        get: {
          summary: 'SLO catalog',
          tags: ['Observability'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'List of SLO definitions and current status' } },
        },
      },
      '/api/observability/agent-costs': {
        get: {
          summary: 'Agent cost metrics',
          tags: ['Observability'],
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Per-agent cost and token usage metrics' } },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/engines/*/routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
