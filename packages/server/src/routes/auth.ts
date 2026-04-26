import { Router } from 'express';
import { authService, workspaceRepo } from '@decidr-code/core';
import { sendJSON, sendError } from '../utils/http';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register — create company + owner account
router.post('/register', async (req, res) => {
  const { companyName, yourName, email, password } = req.body as {
    companyName: string; yourName: string; email: string; password: string;
  };
  if (!companyName?.trim()) return sendError(res, 'Company name is required', 400);
  if (!yourName?.trim())   return sendError(res, 'Your name is required', 400);
  if (!email?.trim())      return sendError(res, 'Email is required', 400);
  if (!password || password.length < 6) return sendError(res, 'Password must be at least 6 characters', 400);

  try {
    const result = await authService.registerWorkspace(companyName, yourName, email, password);
    sendJSON(res, result, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email?.trim() || !password) return sendError(res, 'Email and password are required', 400);

  try {
    const result = await authService.login(email, password);
    sendJSON(res, result);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 401);
  }
});

// GET /api/auth/me — get current user + workspace
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const me = await authService.getMe(req.user!.userId, req.user!.workspaceId);
    if (!me) return sendError(res, 'User not found', 404);
    sendJSON(res, me);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

// POST /api/auth/invite — invite a team member
router.post('/invite', requireAuth, async (req: AuthRequest, res) => {
  const { email, role } = req.body as { email: string; role?: string };
  if (!email?.trim()) return sendError(res, 'Email is required', 400);

  try {
    const result = await authService.inviteMember(
      req.user!.workspaceId,
      email,
      role ?? 'member',
      req.user!.userId
    );
    sendJSON(res, result, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

// POST /api/auth/accept-invite — sign up via invite link
router.post('/accept-invite', async (req, res) => {
  const { token, name, password } = req.body as { token: string; name: string; password: string };
  if (!token?.trim())    return sendError(res, 'Token is required', 400);
  if (!name?.trim())     return sendError(res, 'Name is required', 400);
  if (!password || password.length < 6) return sendError(res, 'Password must be at least 6 characters', 400);

  try {
    const result = await authService.acceptInvite(token, name, password);
    sendJSON(res, result, 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 400);
  }
});

// GET /api/auth/invite/:token — get invite info (for the accept invite screen)
router.get('/invite/:token', async (req, res) => {
  try {
    const { inviteRepo } = await import('@decidr-code/core');
    const invite = await inviteRepo.findByToken(req.params.token);
    if (!invite) return sendError(res, 'Invalid invite link', 404);
    if (invite.usedAt) return sendError(res, 'This invite has already been used', 400);
    if (new Date() > invite.expiresAt) return sendError(res, 'Invite link has expired', 400);
    sendJSON(res, { email: invite.email, role: invite.role, workspaceId: invite.workspaceId });
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

// GET /api/workspace/members — list all members (mounted at /api/workspace, so this = /api/workspace/members)
router.get('/members', requireAuth, async (req: AuthRequest, res) => {
  try {
    const members = await workspaceRepo.getMembers(req.user!.workspaceId);
    sendJSON(res, members);
  } catch (err: unknown) {
    sendError(res, (err as Error).message);
  }
});

export default router;
