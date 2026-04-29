/**
 * Redact common PII patterns before sending text to LLM.
 * This is a pre-flight safety net, NOT a replacement for proper data handling.
 */

const SSN_PATTERN = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g;
const PHONE_PATTERN = /\b(\+?1[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}\b/g;
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const DOB_PATTERN = /\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(19|20)\d{2}\b/g;
const ADDRESS_PATTERN =
  /\b\d{1,5}\s\w+\s(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl)\b/gi;

export interface RedactionResult {
  text: string;
  redactions: Array<{ type: string; original: string; replacement: string }>;
}

export function redactPII(text: string, options?: { keepEmail?: boolean }): RedactionResult {
  const redactions: Array<{ type: string; original: string; replacement: string }> = [];

  let result = text;

  // SSN
  result = result.replace(SSN_PATTERN, (match) => {
    redactions.push({ type: 'SSN', original: match, replacement: '[SSN_REDACTED]' });
    return '[SSN_REDACTED]';
  });

  // DOB
  result = result.replace(DOB_PATTERN, (match) => {
    redactions.push({ type: 'DOB', original: match, replacement: '[DOB_REDACTED]' });
    return '[DOB_REDACTED]';
  });

  // Email (optional -- sometimes needed for the task)
  if (!options?.keepEmail) {
    result = result.replace(EMAIL_PATTERN, (match) => {
      redactions.push({ type: 'EMAIL', original: match, replacement: '[EMAIL_REDACTED]' });
      return '[EMAIL_REDACTED]';
    });
  }

  // Phone
  result = result.replace(PHONE_PATTERN, (match) => {
    redactions.push({ type: 'PHONE', original: match, replacement: '[PHONE_REDACTED]' });
    return '[PHONE_REDACTED]';
  });

  // Address
  result = result.replace(ADDRESS_PATTERN, (match) => {
    redactions.push({ type: 'ADDRESS', original: match, replacement: '[ADDRESS_REDACTED]' });
    return '[ADDRESS_REDACTED]';
  });

  return { text: result, redactions };
}
