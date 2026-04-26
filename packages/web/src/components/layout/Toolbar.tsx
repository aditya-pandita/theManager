import { useRef, useState } from 'react';
import { Icons } from '../shared/Icons';
import { PRIORITY } from '../../constants';
import { api } from '../../api/client';
import { ExportModal } from '../export/ExportModal';
import { useProjectStore } from '../../stores/project-store';
import type { Priority } from '../../types';

interface ImportResult { imported: number; skipped: number; total: number; errors: string[] }

interface ToolbarProps {
  search: string;
  filterPriority: Priority | null;
  onSearch: (q: string) => void;
  onFilter: (p: Priority | null) => void;
  onNewTicket: () => void;
  onImportDone?: () => void;
}

export function Toolbar({ search, filterPriority, onSearch, onFilter, onNewTicket, onImportDone }: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  // Send the user's currently-selected project so imported rows land inside it
  // instead of as orphan tickets visible only under "All Projects".
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const res = await api.importCSV<ImportResult>(text, activeProjectId);
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
    <div style={{ padding: '14px 28px', display: 'flex', gap: '10px', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
      <input
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 14px', color: 'var(--text)', fontSize: '12px', outline: 'none', width: '240px' }}
        placeholder="Search tickets..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <div style={{ display: 'flex', gap: '4px' }}>
        {([null, ...Object.keys(PRIORITY)] as Array<Priority | null>).map((p) => (
          <button
            key={p ?? 'all'}
            onClick={() => onFilter(p)}
            style={{
              padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 600, transition: 'all 0.15s',
              border: `1px solid ${filterPriority === p ? '#3B82F6' : 'var(--border)'}`,
              background: filterPriority === p ? '#172554' : 'transparent',
              color: filterPriority === p ? '#60a5fa' : 'var(--text-muted)',
            }}
          >
            {p ? PRIORITY[p].label : 'ALL'}
          </button>
        ))}
      </div>

      {/* Import result toast */}
      {result && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px',
          background: result.errors.length ? '#2d1a1a' : '#0f2a1a',
          border: `1px solid ${result.errors.length ? '#7f1d1d' : '#14532d'}`,
          color: result.errors.length ? '#fca5a5' : '#86efac', fontSize: '11px',
        }}>
          {result.errors.length
            ? `✗ ${result.errors[0]}`
            : `✓ Imported ${result.imported} of ${result.total} tickets`}
          <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0 2px', fontSize: '13px' }}>×</button>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" style={{ display: 'none' }} onChange={handleFile} />

      {/* Export button */}
      <button
        onClick={() => setExportOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px',
          border: '1px solid var(--border)', background: 'var(--button-bg)',
          color: 'var(--text-soft)', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3B82F6')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        title="Export project as Markdown or HTML"
      >
        ↓ Export
      </button>

      {/* Import button */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={importing}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px',
          border: '1px solid var(--border)', background: importing ? 'var(--button-disabled)' : 'var(--button-bg)',
          color: importing ? 'var(--text-faint)' : 'var(--text-soft)', cursor: importing ? 'not-allowed' : 'pointer',
          fontSize: '12px', fontWeight: 600, transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { if (!importing) e.currentTarget.style.borderColor = '#3B82F6'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        title="Import tickets from a CSV file (Jira export format supported)"
      >
        {importing ? '⟳ Importing…' : '↑ Import CSV'}
      </button>

      {/* New ticket button */}
      <button
        onClick={onNewTicket}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px',
          border: 'none', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff',
          cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
      >
        <Icons.Plus /> New Ticket
      </button>

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}
