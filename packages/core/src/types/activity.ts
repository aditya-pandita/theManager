export type ActorType = 'user' | 'agent' | 'system' | 'hook' | 'mcp';

export interface Activity {
  id:             number;
  ticketId:       string | null;
  projectId:      string | null;
  actorType:      ActorType;
  actorName:      string | null;
  actionType:     string;
  payload:        unknown;
  beforeSnapshot: unknown;
  afterSnapshot:  unknown;
  tokensUsed:     number | null;
  costUsd:        number | null;
  isImmutable:    boolean;
  createdAt:      Date;
}

export interface NewActivity {
  ticketId?:       string;
  projectId?:      string;
  actorType:       ActorType;
  actorName?:      string;
  actionType:      string;
  payload?:        unknown;
  beforeSnapshot?: unknown;
  afterSnapshot?:  unknown;
  tokensUsed?:     number;
  costUsd?:        number;
  isImmutable?:    boolean;
}

export interface ActivityFilters {
  actorType?:  ActorType;
  actionType?: string;
  after?:      Date;
  before?:     Date;
  search?:     string;
}

export interface ChatMessage {
  id:               number;
  ticketId:         string;
  threadId:         string | null;
  role:             'user' | 'agent';
  agentName:        string | null;
  content:          string;
  contextAssembled: unknown;
  actionsTaken:     unknown;
  tokensUsed:       number | null;
  costUsd:          number | null;
  createdAt:        Date;
}

export interface NewChatMessage {
  ticketId:          string;
  threadId?:         string;
  role:              'user' | 'agent';
  agentName?:        string;
  content:           string;
  contextAssembled?: unknown;
  actionsTaken?:     unknown;
  tokensUsed?:       number;
  costUsd?:          number;
}
