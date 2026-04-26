import { useRef, useState } from 'react';
import { Icons } from '../shared/Icons';
import { PRIORITY, TAGS } from '../../constants';
import { api } from '../../api/client';
import { ExportModal } from '../export/ExportModal';
import type { Priority } from '../../types';

interface ImportResult { imported: number; skipped: number; total: number; errors: string[] }

interface ToolbarProps {
  search: string;
  filterPriority: Priority | null;
  filterTag?: string | null;
  onSearch: (q: string) => void;
  onFilter: (p: Priority | null) => void;
  onFilterTag?: (tag: string | null) => void;
  onNewTicket: () => void;
  onImportDone?: () => void;
}

const TAG_COLORS: Record<string, string> = {
  bug: '#ef4444', feature: '#3b82f6', refactor: '#8b5cf6',
  docs: '#f59e0b', test: '#06b6d4',
};

export function Toolbar({ search, filterPriority, filterTag, onSearch, onFilter, onFilterTag, onNewTicket, onImportDone }: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult(null);
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

  const filterBtn = (active: boolean, color?: string): React.CSSProperties => ({
    padding: '5px 11px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 600,
    border: `1px solid ${active ? (color ?? '#3B82F6') : '#1e2330'}`,
    background: active ? `${color ?? '#3B82F6'}18` : 'transparent',
    color: active ? (color ?? '#60a5fa') : '#6B7280',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ padding: '10px 28px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #1e233050' }}>

      {/* Row 1: search + priority filters + action buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{ background: '#111318', border: '1px solid #1e2330', borderRadius: '8px', padding: '7px 14px', color: '#e2e8f0', fontSize: '12px', outline: 'none', width: '220px' }}
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />

        {/* Priority filters */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ color: '#475569', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', marginRight: '2px' }}>PRIORITY</span>
          {([null, ...Object.keys(PRIORITY)] as Array<Priority | null>).map((p) => (
            <button key={p ?? 'all'} onClick={() => onFilter(p)} style={filterBtn(filterPriority === p)}>
              {p ? PRIORITY[p].label : 'ALL'}
            </button>
          ))}
        </div>

        {/* Import result toast */}
        {result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', borderRadius: '8px', background: result.errors.length ? '#2d1a1a' : '#0f2a1a', border: `1px solid ${result.errors.length ? '#7f1d1d' : '#14532d'}`, color: result.errors.length ? '#fca5a5' : '#86efac', fontSize: '11px' }}>
            {result.errors.length ? `✗ ${result.errors[0]}` : `✓ Imported ${result.imported} of ${result.total} tickets`}
            <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0 2px', fontSize: '13px' }}>×</button>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" style={{ display: 'none' }} onChange={handleFile} />

        <button onClick={() => setExportOpen(true)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #1e2330', background: '#111318', color: '#9CA3AF', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
          ↓ Export
        </button>

        <button onClick={() => fileRef.current?.click()} disabled={importing} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #1e2330', background: importing ? '#1a1f2e' : '#111318', color: importing ? '#4B5563' : '#9CA3AF', cursor: importing ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600 }}>
          {importing ? '⟳ Importing…' : '↑ Import CSV'}
        </button>

        <button
          onClick={onNewTicket}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
        >
          <Icons.Plus /> New Ticket
        </button>
      </div>

      {/* Row 2: tag filters */}
      {onFilterTag && (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ color: '#475569', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', marginRight: '2px' }}>TAG</span>
          <button onClick={() => onFilterTag(null)} style={filterBtn(filterTag === null || filterTag === undefined)}>
            ALL
          </button>
          {TAGS.map((tag) => (
            <button key={tag} onClick={() => onFilterTag(filterTag === tag ? null : tag)} style={filterBtn(filterTag === tag, TAG_COLORS[tag])}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}
