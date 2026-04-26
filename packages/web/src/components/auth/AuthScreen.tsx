import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../api/client';

type Mode = 'login' | 'register' | 'invite';

const inp: React.CSSProperties = {
  width: '100%', background: '#fff', border: '1.5px solid #e2e8f0',
  borderRadius: '10px', padding: '11px 14px', color: '#1e293b',
  fontSize: '14px', boxSizing: 'border-box', outline: 'none',
  fontFamily: 'inherit', transition: 'border-color 0.15s',
};

const lbl: React.CSSProperties = {
  fontSize: '12px', fontWeight: 600, color: '#374151',
  display: 'block', marginBottom: '6px',
};

export function AuthScreen() {
  const { login, register, acceptInvite } = useAuthStore();

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

  useEffect(() => {
    if (inviteToken) {
      api.get<any>(`/api/auth/invite/${inviteToken}`)
        .then((d) => setInviteEmail(d.email))
        .catch(() => setError('Invalid or expired invite link'));
    }
  }, [inviteToken]);

  const handleSubmit = async () => {
    setError(null);
    if ((mode === 'register' || mode === 'invite') && password !== confirmPw) {
      setError('Passwords do not match');
      return;
    }
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
    if (mode === 'login')    return email.trim().length > 0 && password.length >= 6;
    if (mode === 'register') return companyName.trim().length > 0 && name.trim().length > 0 && email.trim().length > 0 && password.length >= 6 && password === confirmPw;
    if (mode === 'invite')   return name.trim().length > 0 && password.length >= 6 && password === confirmPw;
    return false;
  })();

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && canSubmit) handleSubmit(); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter','DM Sans',system-ui,sans-serif", background: '#f8fafc' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: 460, flexShrink: 0, background: 'linear-gradient(145deg,#1e40af 0%,#2563eb 60%,#3b82f6 100%)', padding: '56px 52px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* background circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '56px' }}>
          <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: 800 }}>DC</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '20px' }}>Decidr Code</span>
        </div>

        {/* Headline */}
        <div style={{ flex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: 800, lineHeight: 1.25, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            {mode === 'invite' ? 'Join your team' : 'Ship faster with AI agents'}
          </h1>
          <p style={{ color: '#bfdbfe', fontSize: '16px', lineHeight: 1.7, margin: '0 0 48px' }}>
            {mode === 'invite'
              ? 'You have been invited to collaborate on Decidr Code. Set up your account to get started.'
              : 'Your AI development platform. Plan, code, test and review — every decision visible and tracked.'}
          </p>

          {/* Feature dots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              '7 specialized AI agents working in sequence',
              'Git branch auto-linking per ticket',
              'Full audit trail of every AI decision',
              'Team collaboration with role-based access',
              'Real code generated directly to your project folder',
            ].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 5L4 7L8 3"/>
                  </svg>
                </div>
                <span style={{ color: '#dbeafe', fontSize: '13px' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <span style={{ color: '#93c5fd', fontSize: '12px' }}>Powered by Gemma 4 · Built for production teams</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mode toggle (not for invite) */}
          {mode !== 'invite' && (
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '32px' }}>
              {(['login', 'register'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); }}
                  style={{
                    flex: 1, padding: '9px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
                    background: mode === m ? '#fff' : 'transparent',
                    color: mode === m ? '#1e293b' : '#64748b',
                    boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {m === 'login' ? 'Sign In' : 'Create Workspace'}
                </button>
              ))}
            </div>
          )}

          {/* Heading */}
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {mode === 'login'    ? 'Welcome back'
             : mode === 'register' ? 'Set up your workspace'
             : `Join workspace`}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px' }}>
            {mode === 'login'    ? 'Sign in to your Decidr Code workspace.'
             : mode === 'register' ? 'Create your company workspace and get started.'
             : `Signing up as ${inviteEmail}`}
          </p>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {mode === 'register' && (
              <div>
                <label style={lbl}>Company / Workspace Name</label>
                <input
                  value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp" style={inp} autoFocus onKeyDown={onKey}
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
            )}

            {(mode === 'register' || mode === 'invite') && (
              <div>
                <label style={lbl}>Your Full Name</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Rohit Dabhi" style={inp} autoFocus={mode === 'invite'} onKeyDown={onKey}
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
            )}

            {mode !== 'invite' && (
              <div>
                <label style={lbl}>Email Address</label>
                <input
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com" type="email" style={inp}
                  autoFocus={mode === 'login'} onKeyDown={onKey}
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
            )}

            {mode === 'invite' && inviteEmail && (
              <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '11px 14px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Signing up as </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0369a1' }}>{inviteEmail}</span>
              </div>
            )}

            <div>
              <label style={lbl}>Password</label>
              <input
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters" type="password" style={inp} onKeyDown={onKey}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {(mode === 'register' || mode === 'invite') && (
              <div>
                <label style={lbl}>Confirm Password</label>
                <input
                  value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat your password" type="password" style={{
                    ...inp,
                    borderColor: confirmPw && confirmPw !== password ? '#ef4444' : '#e2e8f0',
                  }} onKeyDown={onKey}
                  onFocus={(e) => (e.target.style.borderColor = confirmPw !== password ? '#ef4444' : '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = confirmPw && confirmPw !== password ? '#ef4444' : '#e2e8f0')}
                />
                {confirmPw && confirmPw !== password && (
                  <p style={{ fontSize: '12px', color: '#ef4444', margin: '5px 0 0' }}>Passwords do not match</p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="7" y1="4.5" x2="7" y2="7.5"/><circle cx="7" cy="9.5" r="0.5" fill="#dc2626" stroke="none"/></svg>
                <span style={{ fontSize: '13px', color: '#dc2626' }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px', border: 'none', fontFamily: 'inherit',
                background: canSubmit && !submitting ? '#2563eb' : '#e2e8f0',
                color: canSubmit && !submitting ? '#fff' : '#94a3b8',
                fontSize: '14px', fontWeight: 700, cursor: canSubmit && !submitting ? 'pointer' : 'default',
                transition: 'all 0.15s', marginTop: '4px',
              }}
            >
              {submitting ? 'Please wait…'
                : mode === 'login'    ? 'Sign In'
                : mode === 'register' ? 'Create Workspace'
                : 'Join Workspace'}
            </button>
          </div>

          {/* Toggle between login / register */}
          {mode === 'login' && (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '24px' }}>
              New to Decidr Code?{' '}
              <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: 0 }}>
                Create a workspace
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '24px' }}>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: 0 }}>
                Sign in
              </button>
            </p>
          )}

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px', marginTop: '32px' }}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
