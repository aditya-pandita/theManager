import * as vscode from 'vscode';
import { apiPost } from '../utils/api-client';

export async function createTicketCommand(): Promise<void> {
  const title = await vscode.window.showInputBox({ prompt: 'Ticket title', placeHolder: 'e.g. Fix auth middleware' });
  if (!title) return;

  const priority = await vscode.window.showQuickPick(['critical', 'high', 'medium', 'low'], { placeHolder: 'Priority' }) ?? 'medium';

  try {
    const ticket = await apiPost<{ id: string }>('/api/tickets', { title, priority });
    vscode.window.showInformationMessage(`Created ticket ${ticket.id}: ${title}`);
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to create ticket: ${(err as Error).message}`);
  }
}
