import type { Request, Response } from 'express';

export function sendJSON(res: Response, data: unknown, status = 200): void {
  res.status(status).json(data);
}

export function sendError(res: Response, message: string, status = 500): void {
  res.status(status).json({ error: message });
}

export async function parseBody<T>(req: Request): Promise<T> {
  return req.body as T;
}
