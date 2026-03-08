import * as vscode from 'vscode';
import { apiGet } from '../utils/api-client';
import { getBoardHtml } from './webview';

interface Ticket { id: string; title: string; status: string; priority: string }

export class BoardSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'decidr-code.board';
  private _view?: vscode.WebviewView;

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    this.refresh();

    webviewView.webview.onDidReceiveMessage((msg) => {
      if (msg.type === 'openTicket') {
        vscode.env.openExternal(vscode.Uri.parse(`http://localhost:5173`));
      }
    });

    // Auto-refresh every 10s
    const interval = setInterval(() => this.refresh(), 10_000);
    webviewView.onDidDispose(() => clearInterval(interval));
  }

  async refresh(): Promise<void> {
    if (!this._view) return;
    try {
      const tickets = await apiGet<Ticket[]>('/api/tickets');
      this._view.webview.html = getBoardHtml(tickets);
    } catch {
      this._view.webview.html = '<body style="background:#0a0c10;color:#6B7280;padding:16px;font-size:12px">Server not running. Start with: npm run dev:server</body>';
    }
  }
}
