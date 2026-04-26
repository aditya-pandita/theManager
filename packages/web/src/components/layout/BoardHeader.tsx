import { useRef, useState } from 'react';
import { PRIORITY, TAGS } from '../../constants';
import { api } from '../../api/client';
import { ExportModal } from '../export/ExportModal';
import { Icons } from '../shared/Icons';
import type { Priority } from '../../types';

interface ImportResult { imported: number; skipped: number; total: number; errors: string[] }

interface BoardHeaderProps {
  search: string;
  filterPriority: Priority | null;
  filterTag?: string | null;
  viewMode: 'board' | 'list';
  onViewModeChange: (m: 'board' | 'list') => void;
  onSearch: (q: string) => void;
  onFilter: (p: Priority | null) => void;
  onFilterTag?: (tag: string | null) => void;
  onNewTicket: () => void;
  onImportDone?: () => void;
  ticketCount: number;
}

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  bug:      { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  feature:  { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  refactor: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  docs:     { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  test:     { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  high:     { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
  medium:   { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  low:      { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
};

export function BoardHeader({ search, filterPriority, filterTag, viewMode, onViewModeChange, onSearch, onFilter, onFilterTag, onNewTicket, onImportDone, ticketCount }: BoardHeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const res = await api.importCSV<ImportResult>(text);
      setResult(res);
      onImportDone?.();
    } catch (err) {
      setResult({ imported: 0, skipped: 0, total: 0, errors: [(err as Error).message] });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 28px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>

      {/* Row 1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Board / List toggle */}
        <div style={{ display: 'flex', gap: '3px', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
          {(['board', 'list'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onViewModeChange(m)}
              style={{
                padding: '5px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                background: viewMode === m ? '#fff' : 'transparent',
                color: viewMode === m ? '#1e293b' : '#64748b',
                boxShadow: viewMode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{m === 'board' ? <><Icons.Board /> Board</> : <><Icons.List /> List</>}</span>
            </button>
          ))}
        </div>

        {/* Priority filter pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {([null, ...Object.keys(PRIORITY)] as Array<Priority | null>).map((p) => {
            const active = filterPriority === p;
            const pc = p ? PRIORITY_COLORS[p] : null;
            return (
              <button
                key={p ?? 'all'}
                onClick={() => onFilter(p)}
                style={{
                  padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: active ? 600 : 400, transition: 'all 0.15s',
                  border: `1px solid ${active && pc ? pc.border : '#e2e8f0'}`,
                  background: active && pc ? pc.bg : '#fff',
                  color: active && pc ? pc.text : '#64748b',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}
              >
                {p && <span style={{ width: 6, height: 6, borderRadius: '50%', background: pc?.text, display: 'inline-block' }} />}
                {p ? PRIORITY[p].label.charAt(0) + PRIORITY[p].label.slice(1).toLowerCase() : 'All Status'}
                <span style={{ color: '#d1d5db', fontSize: '10px' }}>▾</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}><Icons.Search /></span>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search tickets..."
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '7px 12px 7px 32px', color: '#1e293b', fontSize: '12px', outline: 'none', width: '200px' }}
          />
        </div>

        {/* Sort */}
        <select style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '7px 12px', color: '#64748b', fontSize: '12px', cursor: 'pointer', outline: 'none' }}>
          <option>Recently Updated</option>
          <option>Priority</option>
          <option>Created</option>
        </select>

        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} disabled={importing} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
          <Icons.Import /> {importing ? 'Importing…' : 'Import'}
        </button>
        <button onClick={() => setExportOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
          <Icons.Export /> Export
        </button>
        <button onClick={onNewTicket} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <Icons.Plus /> New Ticket
        </button>
      </div>

      {/* Row 2 — tag filters */}
      {onFilterTag && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginRight: '4px' }}>Filter:</span>
          <button onClick={() => onFilterTag(null)} style={{ padding: '3px 12px', borderRadius: '20px', border: `1px solid ${!filterTag ? '#2563eb' : '#e2e8f0'}`, background: !filterTag ? '#eff6ff' : '#fff', color: !filterTag ? '#2563eb' : '#64748b', fontSize: '11px', fontWeight: !filterTag ? 600 : 400, cursor: 'pointer' }}>
            All
          </button>
          {TAGS.map((tag) => {
            const active = filterTag === tag;
            const tc = TAG_COLORS[tag] ?? { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
            return (
              <button key={tag} onClick={() => onFilterTag(active ? null : tag)} style={{ padding: '3px 12px', borderRadius: '20px', border: `1px solid ${active ? tc.border : '#e2e8f0'}`, background: active ? tc.bg : '#fff', color: active ? tc.text : '#64748b', fontSize: '11px', fontWeight: active ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                {tag}
              </button>
            );
          })}
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94a3b8' }}>{ticketCount} tickets</span>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', background: result.errors.length ? '#fef2f2' : '#f0fdf4', border: `1px solid ${result.errors.length ? '#fecaca' : '#bbf7d0'}`, color: result.errors.length ? '#dc2626' : '#16a34a', fontSize: '12px' }}>
          {result.errors.length ? `✗ ${result.errors[0]}` : `✓ Imported ${result.imported} of ${result.total} tickets`}
          <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'auto', fontSize: '14px' }}>×</button>
        </div>
      )}

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}
