import * as vscode from 'vscode';
import { apiGet, apiPost } from '../utils/api-client';

interface Ticket { id: string; title: string }

export async function processTicketCommand(): Promise<void> {
  try {
    const tickets = await apiGet<Ticket[]>('/api/tickets');
    const items = tickets.map((t) => ({ label: t.id, description: t.title }));
    const picked = await vscode.window.showQuickPick(items, { placeHolder: 'Select ticket to process with Claude' });
    if (!picked) return;

    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: `Processing ${picked.label}...`, cancellable: false },
      async () => { await apiPost('/api/process', { ticketId: picked.label }); }
    );

    vscode.window.showInformationMessage(`Reasoning generated for ${picked.label}. Open Decidr Code to view.`);
  } catch (err) {
    vscode.window.showErrorMessage(`Processing failed: ${(err as Error).message}`);
  }
}
