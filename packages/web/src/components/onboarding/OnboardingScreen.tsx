import { useRef, useState } from 'react';
import { api } from '../../api/client';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 state
  const [projectName, setProjectName]   = useState('');
  const [folderPath, setFolderPath]     = useState('');
  const [description, setDescription]   = useState('');
  const [color, setColor]               = useState('#3B82F6');
  const [gitEnabled, setGitEnabled]     = useState(false);
  const [gitRepoUrl, setGitRepoUrl]     = useState('');

  // Step 2 state
  const [documentText, setDocumentText] = useState('');
  const [fileName, setFileName]         = useState('');
  const [isDragging, setIsDragging]     = useState(false);

  // Shared
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [createdTickets, setCreatedTickets]     = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step 1: create project ──────────────────────────────────────
  const handleCreateProject = async () => {
    if (!projectName.trim() || !folderPath.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const project = await api.post<any>('/api/bootstrap/project', {
        name:       projectName.trim(),
        description: description.trim() || undefined,
        color,
        folderPath: folderPath.trim(),
        gitRepoUrl: gitEnabled && gitRepoUrl.trim() ? gitRepoUrl.trim() : undefined,
      });
      setCreatedProjectId(project.id);
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 2: parse document ──────────────────────────────────────
  const handleParseDocument = async () => {
    if (!documentText.trim() || !createdProjectId) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.post<{ tickets: string[] }>('/api/bootstrap/document', {
        projectId: createdProjectId,
        document:  documentText.trim(),
      });
      setCreatedTickets(result.tickets);
      setStep(3);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── File read (upload button + drag-drop) ───────────────────────
  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDocumentText(ev.target?.result as string ?? '');
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const canContinue = projectName.trim().length > 0 && folderPath.trim().length > 0;

  // ── Shared styles ───────────────────────────────────────────────
  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: '100%', background: '#0d1117', border: '1px solid #1e2330',
    borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
    fontFamily: 'inherit', ...extra,
  });

  const label = (text: string) => (
    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '7px', textTransform: 'uppercase' }}>
      {text}
    </span>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: '340px', flexShrink: 0, background: 'linear-gradient(160deg,#0f1623 0%,#080a0f 100%)',
        borderRight: '1px solid #1a2030', padding: '56px 40px', display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: 32, height: 32, background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⬡</div>
            <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '18px' }}>Decidr Code</span>
          </div>
          <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>AI-powered development platform</p>
        </div>

        {/* Steps */}
        {[
          { n: 1, title: 'Project Setup',       desc: 'Name, folder & git repo' },
          { n: 2, title: 'Import Requirements', desc: 'Upload PRD or SRS document' },
          { n: 3, title: 'Ready to Build',      desc: 'Tickets created, start coding' },
        ].map(({ n, title, desc }) => {
          const done    = step > n;
          const active  = step === n;
          return (
            <div key={n} style={{ display: 'flex', gap: '14px', marginBottom: '28px', opacity: active ? 1 : done ? 0.9 : 0.4 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, flexShrink: 0,
                  background: done ? '#22c55e' : active ? '#3b82f6' : '#1e2533',
                  color: done || active ? '#fff' : '#475569',
                  border: active ? '2px solid #3b82f622' : 'none',
                }}>
                  {done ? '✓' : n}
                </div>
                {n < 3 && <div style={{ width: 1, flex: 1, minHeight: 20, background: done ? '#22c55e44' : '#1e2533', margin: '4px 0' }} />}
              </div>
              <div style={{ paddingTop: '4px' }}>
                <div style={{ color: active ? '#e2e8f0' : done ? '#94a3b8' : '#475569', fontWeight: 600, fontSize: '13px' }}>{title}</div>
                <div style={{ color: '#334155', fontSize: '12px', marginTop: '2px' }}>{desc}</div>
              </div>
            </div>
          );
        })}

        {/* Feature list */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #1a2030', paddingTop: '24px' }}>
          {[
            '🤖 7 specialized AI agents',
            '🌿 Git branch auto-linking',
            '📁 Real code written to disk',
            '🧪 TDD with test generation',
            '📋 Full audit trail & history',
          ].map((f) => (
            <div key={f} style={{ color: '#475569', fontSize: '12px', marginBottom: '8px' }}>{f}</div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          {/* ══ STEP 1 ══ */}
          {step === 1 && (
            <>
              <h2 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>Create your project</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px' }}>Set up your project workspace. AI agents will generate real code into this folder.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Name */}
                <div>
                  {label('Project name *')}
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && canContinue && handleCreateProject()}
                    placeholder="My Web App"
                    autoFocus
                    style={inp()}
                  />
                </div>

                {/* Folder */}
                <div>
                  {label('Project folder path *')}
                  <input
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    placeholder={`/Users/${typeof navigator !== 'undefined' ? 'you' : 'you'}/Desktop/MyApp`}
                    style={inp()}
                  />
                  <p style={{ color: '#334155', fontSize: '11px', margin: '5px 0 0' }}>
                    Type the full path where you want the project created. AI agents will save code here.
                  </p>
                </div>

                {/* Description */}
                <div>
                  {label('Description')}
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What are you building? (e.g. A React dashboard with auth and real-time data)"
                    rows={2}
                    style={{ ...inp(), resize: 'vertical' }}
                  />
                </div>

                {/* Color */}
                <div>
                  {label('Project colour')}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {COLORS.map((c) => (
                      <button key={c} onClick={() => setColor(c)} style={{
                        width: 30, height: 30, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                        outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '3px',
                      }} />
                    ))}
                  </div>
                </div>

                {/* Git toggle */}
                <div style={{ background: '#0d1117', border: '1px solid #1e2330', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 600 }}>🌿 Link Git repository</div>
                      <div style={{ color: '#334155', fontSize: '12px', marginTop: '2px' }}>Auto-link branches to tickets like Jira</div>
                    </div>
                    <div
                      onClick={() => setGitEnabled(!gitEnabled)}
                      style={{ width: 40, height: 22, borderRadius: 9999, background: gitEnabled ? '#3b82f6' : '#1e2533', border: '1px solid #334155', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <div style={{ position: 'absolute', top: 3, left: gitEnabled ? 21 : 3, width: 14, height: 14, borderRadius: '50%', background: '#e2e8f0', transition: 'left 0.2s' }} />
                    </div>
                  </div>
                  {gitEnabled && (
                    <input
                      value={gitRepoUrl}
                      onChange={(e) => setGitRepoUrl(e.target.value)}
                      placeholder="https://github.com/your-org/your-repo"
                      style={{ ...inp({ marginTop: '12px' }) }}
                    />
                  )}
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>⚠ {error}</p>}

                <button
                  onClick={handleCreateProject}
                  disabled={!canContinue || submitting}
                  style={{
                    background: canContinue && !submitting ? '#3b82f6' : '#1e2533',
                    border: 'none', borderRadius: '10px', color: canContinue && !submitting ? '#fff' : '#475569',
                    fontSize: '14px', fontWeight: 700, padding: '13px', cursor: canContinue && !submitting ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                >
                  {submitting ? 'Creating project…' : 'Continue →'}
                </button>
              </div>
            </>
          )}

          {/* ══ STEP 2 ══ */}
          {step === 2 && (
            <>
              <h2 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>Import requirements</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px' }}>
                Upload your PRD, SRS, or feature spec. Gemma 4 will read it and automatically create tickets on your board.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Drag-drop upload zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? '#3b82f6' : documentText ? '#22c55e' : '#1e2533'}`,
                    borderRadius: '12px', padding: '36px 20px', textAlign: 'center', cursor: 'pointer',
                    background: isDragging ? '#3b82f608' : documentText ? '#22c55e08' : '#0d1117',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                    {documentText ? '📄' : '⬆️'}
                  </div>
                  {documentText ? (
                    <>
                      <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '14px' }}>{fileName || 'Document loaded'}</div>
                      <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{documentText.length.toLocaleString()} characters · click to replace</div>
                    </>
                  ) : (
                    <>
                      <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '14px' }}>Drop your document here</div>
                      <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>or click to browse · .md, .txt, .pdf supported</div>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept=".md,.txt,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileInput} />
                </div>

                {/* OR divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: 1, background: '#1e2330' }} />
                  <span style={{ color: '#334155', fontSize: '12px' }}>or paste directly</span>
                  <div style={{ flex: 1, height: 1, background: '#1e2330' }} />
                </div>

                {/* Paste area */}
                <textarea
                  value={documentText}
                  onChange={(e) => { setDocumentText(e.target.value); setFileName(''); }}
                  placeholder="Paste your requirements, user stories, feature list, or spec here...

Example:
- Build a user authentication system with email/password login
- Add a dashboard showing real-time analytics
- Create a REST API for managing products
- Implement role-based access control"
                  rows={8}
                  style={{
                    width: '100%', background: '#0d1117', border: '1px solid #1e2330', borderRadius: '10px',
                    padding: '12px 14px', color: '#e2e8f0', fontSize: '13px', boxSizing: 'border-box',
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6',
                  }}
                />

                {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>⚠ {error}</p>}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={onComplete}
                    style={{ background: 'transparent', border: '1px solid #1e2330', borderRadius: '10px', color: '#64748b', fontSize: '14px', fontWeight: 600, padding: '12px 20px', cursor: 'pointer', flex: 1 }}
                  >
                    Start Empty
                  </button>
                  <button
                    onClick={handleParseDocument}
                    disabled={!documentText.trim() || submitting}
                    style={{
                      background: documentText.trim() && !submitting ? '#3b82f6' : '#1e2533',
                      border: 'none', borderRadius: '10px',
                      color: documentText.trim() && !submitting ? '#fff' : '#475569',
                      fontSize: '14px', fontWeight: 700, padding: '12px 20px', cursor: documentText.trim() && !submitting ? 'pointer' : 'default',
                      flex: 2, transition: 'background 0.2s',
                    }}
                  >
                    {submitting ? '⏳ Analyzing document…' : '✨ Create Tickets from Document'}
                  </button>
                </div>

                <p style={{ color: '#334155', fontSize: '12px', textAlign: 'center', margin: 0 }}>
                  Tickets are created on the board — you trigger the AI pipeline manually per ticket
                </p>
              </div>
            </>
          )}

          {/* ══ STEP 3 ══ */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚀</div>
              <h2 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700, margin: '0 0 10px' }}>
                {createdTickets.length > 0 ? `${createdTickets.length} tickets created!` : 'Project ready!'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 28px', lineHeight: '1.6' }}>
                {createdTickets.length > 0
                  ? 'Your requirements have been converted into tickets. Open any ticket and click Run Pipeline — the AI agents will plan, code, test and review it automatically.'
                  : 'Your project workspace is ready. Create tickets on the board and click Run Pipeline to let the AI agents build for you.'}
              </p>

              {createdTickets.length > 0 && (
                <div style={{ background: '#0d1117', border: '1px solid #1e2330', borderRadius: '10px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Tickets on your board
                  </div>
                  {createdTickets.slice(0, 6).map((id) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid #1a2030' }}>
                      <span style={{ color: '#3b82f6', fontSize: '11px', fontFamily: 'monospace', fontWeight: 600 }}>{id}</span>
                      <span style={{ color: '#22c55e', fontSize: '10px', background: '#22c55e11', padding: '2px 8px', borderRadius: '9999px' }}>backlog</span>
                    </div>
                  ))}
                  {createdTickets.length > 6 && (
                    <div style={{ color: '#475569', fontSize: '12px', marginTop: '8px' }}>+{createdTickets.length - 6} more tickets</div>
                  )}
                </div>
              )}

              {/* Next steps */}
              <div style={{ background: '#0d1117', border: '1px solid #1e2330', borderRadius: '10px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
                <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '12px', textTransform: 'uppercase' }}>What to do next</div>
                {[
                  { icon: '1️⃣', text: 'Open a ticket from the board' },
                  { icon: '2️⃣', text: 'Click Run Pipeline → agents plan, code & test it' },
                  { icon: '3️⃣', text: 'Open your project folder in VS Code to see generated files' },
                  { icon: '4️⃣', text: 'Review, run, and ship your code' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onComplete}
                style={{ background: '#3b82f6', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 700, padding: '14px 32px', cursor: 'pointer', width: '100%' }}
              >
                Open Board →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
