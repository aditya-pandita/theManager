import { useRef, useState } from 'react';
import { api } from '../../api/client';

interface OnboardingScreenProps { onComplete: () => void; }

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#db2777', '#0891b2'];

const inp: React.CSSProperties = {
  width: '100%', background: '#fff', border: '1.5px solid #e2e8f0',
  borderRadius: '10px', padding: '11px 14px', color: '#1e293b',
  fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
};

const lbl: React.CSSProperties = {
  fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px',
};

const StepDot = ({ n, current }: { n: number; current: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, background: current > n ? '#2563eb' : current === n ? '#2563eb' : '#e2e8f0', color: current >= n ? '#fff' : '#94a3b8', transition: 'all 0.3s' }}>
      {current > n
        ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6L5 9L10 3"/></svg>
        : n}
    </div>
    {n < 3 && <div style={{ width: 40, height: 2, background: current > n ? '#2563eb' : '#e2e8f0', transition: 'all 0.3s' }} />}
  </div>
);

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [projectName, setProjectName] = useState('');
  const [folderPath, setFolderPath]   = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor]             = useState('#2563eb');
  const [gitEnabled, setGitEnabled]   = useState(false);
  const [gitRepoUrl, setGitRepoUrl]   = useState('');

  // Step 2
  const [documentText, setDocumentText] = useState('');
  const [fileName, setFileName]         = useState('');
  const [isDragging, setIsDragging]     = useState(false);

  // Shared
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [createdTickets, setCreatedTickets]   = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateProject = async () => {
    if (!projectName.trim() || !folderPath.trim()) return;
    setSubmitting(true); setError(null);
    try {
      const project = await api.post<any>('/api/bootstrap/project', {
        name: projectName.trim(), description: description.trim() || undefined,
        color, folderPath: folderPath.trim(),
        gitRepoUrl: gitEnabled && gitRepoUrl.trim() ? gitRepoUrl.trim() : undefined,
      });
      setCreatedProjectId(project.id);
      setStep(2);
    } catch (err) { setError((err as Error).message); }
    finally { setSubmitting(false); }
  };

  const handleParseDocument = async () => {
    if (!documentText.trim() || !createdProjectId) return;
    setSubmitting(true); setError(null);
    try {
      const result = await api.post<{ tickets: string[] }>('/api/bootstrap/document', { projectId: createdProjectId, document: documentText.trim() });
      setCreatedTickets(result.tickets);
      setStep(3);
    } catch (err) { setError((err as Error).message); }
    finally { setSubmitting(false); }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => { setDocumentText(ev.target?.result as string ?? ''); setFileName(file.name); };
    reader.readAsText(file);
  };

  const canContinue = projectName.trim().length > 0 && folderPath.trim().length > 0;

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#2563eb'; };
  const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#e2e8f0'; };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter','DM Sans',system-ui,sans-serif", display: 'flex' }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: 280, flexShrink: 0, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#2563eb)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 800 }}>DC</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Decidr Code</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>AI Dev Platform</div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { n: 1, title: 'Project Setup', desc: 'Name, folder & git repo' },
            { n: 2, title: 'Requirements', desc: 'Upload PRD or spec doc' },
            { n: 3, title: 'Ready to Build', desc: 'Tickets created on board' },
          ].map(({ n, title, desc }) => (
            <div key={n} style={{ display: 'flex', gap: '16px', marginBottom: n < 3 ? '0' : '0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, background: step > n ? '#2563eb' : step === n ? '#eff6ff' : '#f8fafc', color: step > n ? '#fff' : step === n ? '#2563eb' : '#94a3b8', border: step === n ? '2px solid #2563eb' : '2px solid transparent', transition: 'all 0.3s' }}>
                  {step > n
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6L5 9L10 3"/></svg>
                    : n}
                </div>
                {n < 3 && <div style={{ width: 2, height: 36, background: step > n ? '#2563eb' : '#e2e8f0', margin: '4px 0', transition: 'all 0.3s' }} />}
              </div>
              <div style={{ paddingTop: '4px', paddingBottom: n < 3 ? '28px' : '0' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: step === n ? '#1e293b' : step > n ? '#64748b' : '#94a3b8' }}>{title}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>What you get</div>
          {['7 specialized AI agents', 'Auto-git integration', 'Code saved to your folder', 'Full team collaboration'].map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5L4 7L8 3"/></svg>
              </div>
              <span style={{ fontSize: '12px', color: '#475569' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* ══ STEP 1 ══ */}
          {step === 1 && (
            <>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Create your project</h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 32px', lineHeight: 1.6 }}>Set up your workspace. AI agents will generate real code directly into your project folder.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div>
                  <label style={lbl}>Project Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input value={projectName} onChange={(e) => setProjectName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && canContinue && handleCreateProject()} placeholder="My Web App" style={inp} autoFocus onFocus={onFocus} onBlur={onBlur} />
                </div>

                <div>
                  <label style={lbl}>Project Folder Path <span style={{ color: '#ef4444' }}>*</span></label>
                  <input value={folderPath} onChange={(e) => setFolderPath(e.target.value)} placeholder="/Users/you/Desktop/MyApp" style={inp} onFocus={onFocus} onBlur={onBlur} />
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '5px 0 0' }}>Generated code files will be saved here — open in VS Code, Cursor or any IDE.</p>
                </div>

                <div>
                  <label style={lbl}>Description <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you building? e.g. A React dashboard with auth and real-time data." rows={2} style={{ ...inp, resize: 'vertical' }} onFocus={onFocus} onBlur={onBlur} />
                </div>

                {/* Color */}
                <div>
                  <label style={lbl}>Project Colour</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {COLORS.map((c) => (
                      <button key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: color === c ? `3px solid ${c}` : '3px solid transparent', outline: color === c ? `2px solid #fff` : 'none', outlineOffset: '-4px', cursor: 'pointer', boxShadow: color === c ? `0 0 0 3px ${c}44` : 'none', transition: 'all 0.15s' }} />
                    ))}
                  </div>
                </div>

                {/* Git toggle */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setGitEnabled(!gitEnabled)}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Link a Git Repository</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Auto-link branches to tickets — works like Jira</div>
                    </div>
                    <div style={{ width: 42, height: 24, borderRadius: 9999, background: gitEnabled ? '#2563eb' : '#cbd5e1', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 3, left: gitEnabled ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>
                  {gitEnabled && (
                    <input value={gitRepoUrl} onChange={(e) => setGitRepoUrl(e.target.value)} placeholder="https://github.com/your-org/your-repo" style={{ ...inp, marginTop: '12px', background: '#fff' }} onFocus={onFocus} onBlur={onBlur} />
                  )}
                </div>

                {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '11px 14px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}

                <button onClick={handleCreateProject} disabled={!canContinue || submitting} style={{ padding: '13px', borderRadius: '10px', border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, cursor: canContinue && !submitting ? 'pointer' : 'default', background: canContinue && !submitting ? '#2563eb' : '#e2e8f0', color: canContinue && !submitting ? '#fff' : '#94a3b8', transition: 'all 0.15s' }}>
                  {submitting ? 'Creating project…' : 'Continue →'}
                </button>
              </div>
            </>
          )}

          {/* ══ STEP 2 ══ */}
          {step === 2 && (
            <>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Import requirements</h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 32px', lineHeight: 1.6 }}>Upload your PRD, SRS or feature spec. Gemma 4 will read it and create tickets on your board automatically.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) readFile(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: `2px dashed ${isDragging ? '#2563eb' : documentText ? '#059669' : '#d1d5db'}`, borderRadius: '12px', padding: '32px 24px', textAlign: 'center', cursor: 'pointer', background: isDragging ? '#eff6ff' : documentText ? '#f0fdf4' : '#fff', transition: 'all 0.2s' }}
                >
                  {documentText ? (
                    <>
                      <div style={{ width: 44, height: 44, background: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <svg width="22" height="22" viewBox="0 0 14 14" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 1h8l2 2v10H3z"/><path d="M5 7l2 2 3-3"/></svg>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{fileName || 'Document loaded'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{documentText.length.toLocaleString()} characters · click to replace</div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: 44, height: 44, background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <svg width="22" height="22" viewBox="0 0 14 14" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 9V2"/><path d="M4 6l3 3 3-3"/><path d="M2 11h10"/></svg>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>Drop your document here</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>or click to browse · .md, .txt, .pdf supported</div>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept=".md,.txt,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>or paste directly</span>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>

                {/* Paste textarea */}
                <textarea
                  value={documentText}
                  onChange={(e) => { setDocumentText(e.target.value); setFileName(''); }}
                  placeholder={`Paste your product requirements, user stories or feature list here…\n\nExample:\n- Build user authentication with email/password\n- Add dashboard with real-time analytics\n- Create REST API for product management`}
                  rows={7}
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.6, fontSize: '13px' }}
                  onFocus={onFocus} onBlur={onBlur}
                />

                {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '11px 14px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}

                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, textAlign: 'center' }}>Tickets are created on your board — you trigger AI pipeline manually per ticket.</p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={onComplete} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Start Empty
                  </button>
                  <button onClick={handleParseDocument} disabled={!documentText.trim() || submitting} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, cursor: documentText.trim() && !submitting ? 'pointer' : 'default', background: documentText.trim() && !submitting ? '#2563eb' : '#e2e8f0', color: documentText.trim() && !submitting ? '#fff' : '#94a3b8', transition: 'all 0.15s' }}>
                    {submitting ? 'Analyzing document…' : 'Create Tickets from Document'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ STEP 3 ══ */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              {/* Success icon */}
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg width="34" height="34" viewBox="0 0 14 14" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="7" r="5"/><path d="M5 7l2 2 3-3"/>
                </svg>
              </div>

              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                {createdTickets.length > 0 ? `${createdTickets.length} tickets created!` : 'Project ready!'}
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 32px', lineHeight: 1.6, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
                {createdTickets.length > 0
                  ? 'Your requirements have been converted into tickets. Open any ticket and click Run Pipeline to start the AI agents.'
                  : 'Your project workspace is ready. Create tickets on the board and click Run Pipeline to let the AI build for you.'}
              </p>

              {/* Ticket list */}
              {createdTickets.length > 0 && (
                <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Tickets on your board</div>
                  {createdTickets.slice(0, 6).map((id) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#2563eb' }}>{id}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '9999px' }}>backlog</span>
                    </div>
                  ))}
                  {createdTickets.length > 6 && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>+{createdTickets.length - 6} more tickets</div>}
                </div>
              )}

              {/* Next steps */}
              <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>What to do next</div>
                {[
                  'Open a ticket from the board',
                  'Click Run Pipeline — agents plan, code & test it',
                  'Open your project folder in VS Code to see generated files',
                  'Review, run, and ship your code',
                ].map((text, i) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5, paddingTop: '2px' }}>{text}</span>
                  </div>
                ))}
              </div>

              <button onClick={onComplete} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Open Board →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
