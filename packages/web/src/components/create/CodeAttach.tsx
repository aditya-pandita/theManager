import { Icons } from '../shared/Icons';

interface CodeAttachProps {
  filePath: string;
  code: string;
  onFilePathChange: (v: string) => void;
  onCodeChange: (v: string) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0c0e14', border: '1px solid #1e2330', borderRadius: '8px',
  padding: '10px 14px', color: '#e2e8f0', fontSize: '12px', outline: 'none', fontFamily: "'JetBrains Mono', monospace",
  boxSizing: 'border-box',
};

export function CodeAttach({ filePath, code, onFilePathChange, onCodeChange }: CodeAttachProps) {
  return (
    <div style={{ borderTop: '1px solid #1e2330', paddingTop: '16px' }}>
      <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icons.Code /> ATTACH CODE CONTEXT <span style={{ color: '#4B5563', fontWeight: 400 }}>(optional)</span>
      </label>
      <input style={{ ...inputStyle, marginBottom: '8px' }} placeholder="File path, e.g. src/services/user.ts" value={filePath} onChange={(e) => onFilePathChange(e.target.value)} />
      <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Paste current code here..." value={code} onChange={(e) => onCodeChange(e.target.value)} />
    </div>
  );
}
