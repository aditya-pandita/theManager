import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../api/client';

const inp: React.CSSProperties = {
  width: '100%', background: '#0d1117', border: '1px solid #1e2330',
  borderRadius: '10px', padding: '12px 14px', color: '#e2e8f0',
  fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
};

const primaryBtn = (disabled = false): React.CSSProperties => ({
  width: '100%', background: disabled ? '#1e2533' : '#3b82f6', border: 'none',
  borderRadius: '10px', color: disabled ? '#475569' : '#fff', fontSize: '14px',
  fontWeight: 700, padding: '13px', cursor: disabled ? 'default' : 'pointer',
  transition: 'background 0.2s', fontFamily: 'inherit',
});

type Mode = 'login' | 'register' | 'invite';

export function AuthScreen() {
  const { login, register, acceptInvite } = useAuthStore();

  // detect /invite/:token in URL
  const inviteToken = (() => {
    const m = window.location.pathname.match(/^\/invite\/(.+)$/);
    return m ? m[1] : null;
  })();

  const [mode, setMode] = useState<Mode>(inviteToken ? 'invite' : 'login');
  const [companyName, setCompanyName] = useState('');
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Load invite info
  useEffect(() => {
    if (inviteToken) {
      api.get<any>(`/api/auth/invite/${inviteToken}`)
        .then((d) => setInviteEmail(d.email))
        .catch(() => setError('Invalid or expired invite link'));
    }
  }, [inviteToken]);

  const handleSubmit = async () => {
    setError(null);
    if (mode === 'register' && password !== confirmPw) { setError('Passwords do not match'); return; }
    setSubmitting(true);
    try {
      if (mode === 'login')    await login(email, password);
      if (mode === 'register') await register(companyName, name, email, password);
      if (mode === 'invite')   await acceptInvite(inviteToken!, name, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = (() => {
    if (mode === 'login')    return email.trim() && password.length >= 6;
    if (mode === 'register') return companyName.trim() && name.trim() && email.trim() && password.length >= 6;
    if (mode === 'invite')   return name.trim() && password.length >= 6;
    return false;
  })();

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif" }}>

      {/* Left decorative panel */}
      <div style={{ width: '420px', flexShrink: 0, background: 'linear-gradient(160deg,#0f1623 0%,#080a0f 100%)', borderRight: '1px solid #1a2030', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{ width: 36, height: 36, background: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⬡</div>
            <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '20px' }}>Decidr Code</span>
          </div>
          <h2 style={{ color: '#e2e8f0', fontSize: '28px', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.3 }}>
            {mode === 'invite' ? 'You\'ve been invited!' : 'AI-powered development,\nmade visible'}
          </h2>
          <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
            {mode === 'invite'
              ? `Join your team on Decidr Code. Set up your account to start collaborating on tickets and AI-powered development.`
              : 'Manage your software projects with AI agents that plan, code, test and review — every decision tracked.'}
          </p>
        </div>
        <div>
          {['🤖 7 AI agents working together', '🌿 Git branch auto-linking', '📋 Full audit trail', '👥 Team collaboration'].map((f) => (
            <div key={f} style={{ color: '#334155', fontSize: '13px', marginBottom: '10px' }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {mode !== 'invite' && (
            <div style={{ display: 'flex', background: '#0d1117', border: '1px solid #1e2330', borderRadius: '10px', padding: '4px', marginBottom: '28px' }}>
              {(['login', 'register'] as Mode[]).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(null); }} style={{
                  flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                  background: mode === m ? '#1e2533' : 'transparent',
                  color: mode === m ? '#e2e8f0' : '#475569',
                }}>
                  {m === 'login' ? 'Sign In' : 'Create Workspace'}
                </button>
              ))}
            </div>
          )}

          <div style={{ background: '#13161d', border: '1px solid #1e2330', borderRadius: '14px', padding: '32px' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 700, margin: '0 0 24px' }}>
              {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Set up your workspace' : `Join as ${inviteEmail}`}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {mode === 'register' && (
                <div>
                  <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Company / Workspace Name</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" style={inp} autoFocus />
                </div>
              )}

              {(mode === 'register' || mode === 'invite') && (
                <div>
                  <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Your Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rohit Dabhi" style={inp} autoFocus={mode === 'invite'} />
                </div>
              )}

              {mode !== 'invite' && (
                <div>
                  <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" type="email" style={inp} autoFocus={mode === 'login'} onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()} />
                </div>
              )}

              {mode === 'invite' && inviteEmail && (
                <div style={{ background: '#0d1117', border: '1px solid #1e2330', borderRadius: '8px', padding: '10px 14px' }}>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>Signing up as </span>
                  <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 600 }}>{inviteEmail}</span>
                </div>
              )}

              <div>
                <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" type="password" style={inp} onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()} />
              </div>

              {(mode === 'register' || mode === 'invite') && (
                <div>
                  <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Confirm Password</label>
                  <input value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat password" type="password" style={inp} onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()} />
                </div>
              )}

              {error && (
                <div style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: '8px', padding: '10px 12px', color: '#fca5a5', fontSize: '13px' }}>
                  ⚠ {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={!canSubmit || submitting} style={primaryBtn(!canSubmit || submitting)}>
                {submitting ? 'Please wait…'
                  : mode === 'login' ? 'Sign In'
                  : mode === 'register' ? 'Create Workspace'
                  : 'Join Workspace'}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <p style={{ textAlign: 'center', color: '#334155', fontSize: '13px', marginTop: '20px' }}>
              New to Decidr Code?{' '}
              <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Create a workspace
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
