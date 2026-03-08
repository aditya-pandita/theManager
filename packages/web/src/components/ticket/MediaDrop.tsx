import { Icons } from '../shared/Icons';

export function MediaDrop() {
  return (
    <div>
      <div
        style={{ border: '2px dashed #1e2330', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#4B5563', transition: 'all 0.2s' }}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.color = '#60a5fa'; }}
        onDragLeave={(e) => { e.currentTarget.style.borderColor = '#1e2330'; e.currentTarget.style.color = '#4B5563'; }}
      >
        <Icons.Image />
        <div style={{ marginTop: '10px', fontSize: '13px' }}>Drop screenshots or GIFs here</div>
        <div style={{ marginTop: '4px', fontSize: '11px' }}>PNG, JPG, GIF up to 10MB</div>
      </div>
    </div>
  );
}
