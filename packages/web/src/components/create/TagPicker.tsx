import { TAGS } from '../../constants';

interface TagPickerProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagPicker({ selected, onChange }: TagPickerProps) {
  const toggle = (tag: string) => {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  };

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {TAGS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => toggle(t)}
          style={{
            padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s',
            border: `1px solid ${selected.includes(t) ? '#3B82F6' : '#1e2330'}`,
            background: selected.includes(t) ? '#172554' : 'transparent',
            color: selected.includes(t) ? '#60a5fa' : '#6B7280',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
