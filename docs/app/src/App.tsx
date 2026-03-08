import { useState } from 'react';

const PAGES = ['Architecture', 'API Reference', 'MCP Tools', 'Schemas', 'Hooks', 'Agents', 'Reasoning', 'Editor Setup', 'Extending'];

export default function DocsApp() {
  const [page, setPage] = useState('Architecture');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0c10', color: '#e2e8f0', fontFamily: 'system-ui' }}>
      <nav style={{ width: '220px', borderRight: '1px solid #1e2330', padding: '20px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 16px 20px', fontSize: '14px', fontWeight: 700 }}>Decidr Code Docs</div>
        {PAGES.map((p) => (
          <button key={p} onClick={() => setPage(p)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none',
            background: page === p ? '#1e2330' : 'transparent', color: page === p ? '#e2e8f0' : '#6B7280',
            cursor: 'pointer', fontSize: '13px', borderLeft: page === p ? '2px solid #3B82F6' : '2px solid transparent',
          }}>
            {p}
          </button>
        ))}
      </nav>
      <main style={{ flex: 1, padding: '40px', maxWidth: '800px' }}>
        <h1 style={{ color: '#e2e8f0', marginBottom: '16px' }}>{page}</h1>
        <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
          Documentation content for <strong>{page}</strong> will be added here.
          See <code>BUILD.md</code> and <code>PROMPT-PLAN.md</code> for comprehensive documentation.
        </p>
        {page === 'Architecture' && (
          <pre style={{ background: '#0c0e14', padding: '16px', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', overflow: 'auto' }}>{`
TAURI SHELL (Rust)
  └── React Frontend (Vite :5173)
        └── HTTP :3117
              └── Node.js Sidecar
                    ├── REST API   (:3117)
                    ├── MCP Server (stdio)
                    └── File Bridge (.decidr/)
                          └── Core Engine
                                └── PostgreSQL
          `.trim()}</pre>
        )}
      </main>
    </div>
  );
}
