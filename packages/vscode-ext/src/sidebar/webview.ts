export function getBoardHtml(tickets: Array<{ id: string; title: string; status: string; priority: string }>): string {
  const grouped: Record<string, typeof tickets> = {};
  for (const t of tickets) {
    if (!grouped[t.status]) grouped[t.status] = [];
    grouped[t.status].push(t);
  }

  const colorsMap: Record<string, string> = {
    backlog: '#6B7280', todo: '#F59E0B', in_progress: '#3B82F6', review: '#A855F7', done: '#10B981',
  };

  const cols = ['backlog', 'todo', 'in_progress', 'review', 'done'].map((col) => {
    const items = (grouped[col] ?? []).map((t) => `<div style="padding:6px 8px;border-radius:4px;background:#1a1f2e;margin-bottom:4px;font-size:11px;cursor:pointer" onclick="openTicket('${t.id}')">${t.id} — ${t.title}</div>`).join('');
    return `<div style="margin-bottom:12px"><div style="font-size:10px;font-weight:700;color:${colorsMap[col]};margin-bottom:6px">${col.toUpperCase()} (${(grouped[col] ?? []).length})</div>${items}</div>`;
  }).join('');

  return `<!DOCTYPE html><html><head><style>body{background:#0a0c10;color:#e2e8f0;font-family:system-ui;padding:8px;margin:0}</style></head><body>${cols}<script>const vscode=acquireVsCodeApi();function openTicket(id){vscode.postMessage({type:'openTicket',id})}</script></body></html>`;
}
