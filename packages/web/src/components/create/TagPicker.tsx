import { TAGS } from '../../constants';

const TAG_COLORS: Record<string, { bg: string; color: string; border: string; activeBg: string; activeColor: string; activeBorder: string }> = {
  bug:      { bg: '#fff', color: '#94a3b8', border: '#e2e8f0', activeBg: '#fef2f2', activeColor: '#dc2626', activeBorder: '#fecaca' },
  feature:  { bg: '#fff', color: '#94a3b8', border: '#e2e8f0', activeBg: '#eff6ff', activeColor: '#2563eb', activeBorder: '#bfdbfe' },
  refactor: { bg: '#fff', color: '#94a3b8', border: '#e2e8f0', activeBg: '#f5f3ff', activeColor: '#7c3aed', activeBorder: '#ddd6fe' },
  docs:     { bg: '#fff', color: '#94a3b8', border: '#e2e8f0', activeBg: '#fffbeb', activeColor: '#d97706', activeBorder: '#fde68a' },
  test:     { bg: '#fff', color: '#94a3b8', border: '#e2e8f0', activeBg: '#ecfeff', activeColor: '#0891b2', activeBorder: '#a5f3fc' },
};

export function TagPicker({ selected, onChange }: { selected: string[]; onChange: (tags: string[]) => void }) {
  const toggle = (tag: string) => onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {TAGS.map((t) => {
        const active = selected.includes(t);
        const c = TAG_COLORS[t] ?? { bg: '#fff', color: '#94a3b8', border: '#e2e8f0', activeBg: '#eff6ff', activeColor: '#2563eb', activeBorder: '#bfdbfe' };
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            style={{
              padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: active ? 600 : 400,
              border: `1px solid ${active ? c.activeBorder : c.border}`,
              background: active ? c.activeBg : c.bg,
              color: active ? c.activeColor : c.color,
              transition: 'all 0.15s', textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
