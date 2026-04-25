import { useState } from 'react';
import { useProjectStore } from '../../stores/project-store';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { activeProjectId } = useProjectStore();
  const [format, setFormat] = useState<'markdown' | 'html'>('markdown');
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format });
      if (activeProjectId) params.set('projectId', activeProjectId);
      const url = `/api/export?${params}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `decidr-export.${format === 'html' ? 'html' : 'md'}`;
      a.click();
      URL.revokeObjectURL(a.href);
      onClose();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#13161d', border: '1px solid #1e2330', borderRadius: '12px', padding: '24px', width: '360px' }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#e2e8f0' }}>Export Project</h3>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '8px' }}>Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'markdown' | 'html')}
            style={{ width: '100%', padding: '8px 12px', background: '#0c0e14', border: '1px solid #1e2330', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }}
          >
            <option value="markdown">Markdown (.md)</option>
            <option value="html">HTML (.html)</option>
          </select>
        </div>
        {activeProjectId && (
          <p style={{ fontSize: '11px', color: '#6B7280', marginBottom: '16px' }}>
            Exporting current project only.
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #1e2330', borderRadius: '8px', color: '#6B7280', cursor: 'pointer', fontSize: '13px' }}>
            Cancel
          </button>
          <button onClick={handleExport} disabled={exporting} style={{ padding: '8px 16px', background: '#2563EB', border: 'none', borderRadius: '8px', color: '#fff', cursor: exporting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}>
            {exporting ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
