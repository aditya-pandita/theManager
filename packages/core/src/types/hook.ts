export interface HookEvent {
  id: number;
  event: string;
  payload: Record<string, unknown> | null;
  createdAt: Date;
}
