import * as vscode from 'vscode';
import { BoardSidebarProvider } from './sidebar/provider';
import { createTicketCommand } from './commands/create-ticket';
import { listTicketsCommand } from './commands/list-tickets';
import { processTicketCommand } from './commands/process-ticket';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new BoardSidebarProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(BoardSidebarProvider.viewType, provider),
    vscode.commands.registerCommand('decidr-code.createTicket', createTicketCommand),
    vscode.commands.registerCommand('decidr-code.listTickets', listTicketsCommand),
    vscode.commands.registerCommand('decidr-code.processTicket', processTicketCommand)
  );
}

export function deactivate(): void {}
