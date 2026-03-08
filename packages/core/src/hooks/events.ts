export const EVENTS = {
  SESSION_START: 'SessionStart',
  TICKET_CREATED: 'TicketCreated',
  TICKET_MOVED: 'TicketMoved',
  TICKET_DELETED: 'TicketDeleted',
  POST_SAVE: 'PostSave',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
