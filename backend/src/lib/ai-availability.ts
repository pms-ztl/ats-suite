import { checkLLMAvailability } from '../agents/runtime';
import logger from './logger';

export interface AIStatusResult {
  available: boolean;
  anthropic: boolean;
  openai: boolean;
  agents: Record<string, { available: boolean; reason?: string }>;
  message: string;
}

/**
 * Check which AI capabilities are available based on configured API keys.
 * Used by the frontend to show/hide AI features and by routes to return
 * structured errors instead of crashes.
 */
export function getAIStatus(): AIStatusResult {
  const anthropicCheck = checkLLMAvailability('claude-sonnet-4-20250514');
  const openaiCheck = checkLLMAvailability('gpt-4.1');

  const agents: Record<string, { available: boolean; reason?: string }> = {
    'resume-parser': anthropicCheck,
    'candidate-screener': anthropicCheck,
    'jd-author': anthropicCheck,
    'interview-scheduler': anthropicCheck,
    'candidate-assistant': anthropicCheck, // Uses Haiku (still Anthropic)
    'talent-sourcer': anthropicCheck,
    'interview-kit-generator': anthropicCheck,
    'interview-intelligence': anthropicCheck,
    'offer-generator': anthropicCheck,
    'hiring-copilot': anthropicCheck,
    'analytics-insights': anthropicCheck,
    'bias-auditor': anthropicCheck,
    'embeddings': openaiCheck,
  };

  const anyAvailable = anthropicCheck.available || openaiCheck.available;

  const message = !anthropicCheck.available && !openaiCheck.available
    ? 'No AI provider configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY in .env to enable AI features. The ATS works fully for manual hiring workflows without AI.'
    : !anthropicCheck.available
      ? 'ANTHROPIC_API_KEY not set — AI agents disabled. Manual hiring workflows work normally. Set the key in .env to enable AI screening, JD authoring, and other agent features.'
      : !openaiCheck.available
        ? 'OPENAI_API_KEY not set — embeddings and vector search disabled. AI agents work but without semantic search capability.'
        : 'All AI providers configured and ready.';

  if (!anyAvailable) {
    logger.info('AI status: No providers configured — running in manual-only mode');
  }

  return {
    available: anyAvailable,
    anthropic: anthropicCheck.available,
    openai: openaiCheck.available,
    agents,
    message,
  };
}

/**
 * Middleware-style error handler for AI_NOT_CONFIGURED errors.
 * Returns a structured 503 response instead of a 500 crash.
 */
export function handleAIError(err: Error): {
  statusCode: number;
  body: { error: { code: string; message: string; aiRequired: boolean; setupGuide: string } };
} | null {
  if (err.message?.startsWith('AI_NOT_CONFIGURED:')) {
    return {
      statusCode: 503,
      body: {
        error: {
          code: 'AI_NOT_CONFIGURED',
          message: err.message.replace('AI_NOT_CONFIGURED: ', ''),
          aiRequired: true,
          setupGuide: 'Set ANTHROPIC_API_KEY in your .env file. Get a key at https://console.anthropic.com',
        },
      },
    };
  }
  return null;
}
