import crypto from 'crypto';

export function immutableHash(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}

export function generateId(): string {
  return crypto.randomUUID();
}
