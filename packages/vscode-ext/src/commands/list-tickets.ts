import * as vscode from 'vscode';
import { apiGet } from '../utils/api-client';

interface Ticket { id: string; title: string; status: string; priority: string }

export async function listTicketsCommand(): Promise<void> {
  try {
    const tickets = await apiGet<Ticket[]>('/api/tickets');
    const items = tickets.map((t) => ({ label: `${t.id} [${t.status}]`, description: t.title, detail: `Priority: ${t.priority}` }));
    const picked = await vscode.window.showQuickPick(items, { placeHolder: 'Select a ticket' });
    if (picked) {
      vscode.env.openExternal(vscode.Uri.parse('http://localhost:5173'));
    }
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to list tickets: ${(err as Error).message}`);
  }
}
