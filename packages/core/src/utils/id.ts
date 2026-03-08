import { randomBytes } from 'crypto';

export function generateId(): string {
  return 'DC-' + randomBytes(3).toString('hex').toUpperCase();
}
