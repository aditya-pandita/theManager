import { useEffect, useState } from 'react';
import { useMemberStore } from '../../stores/member-store';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../api/client';
import { Icons } from '../shared/Icons';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const ROLE_COLORS: Record<string, string> = { owner: '#3b82f6', manager: '#8b5cf6', member: '#64748b' };

export function TeamPanel() {
  const { members, fetchMembers } = useMemberStore();
  const { member: myMembership } = useAuthStore();
  const canInvite = myMembership?.role === 'owner' || myMembership?.role === 'manager';
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState<'manager' | 'member'>('member');
  const [inviting, setInviting]       = useState(false);
  const [inviteUrl, setInviteUrl]     = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [copied, setCopied]           = useState(false);

  useEffect(() => { fetchMembers(); }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    setInviteUrl(null);
    try {
      const result = await api.post<any>('/api/auth/invite', { email: inviteEmail.trim(), role: inviteRole });
      setInviteUrl(result.inviteUrl);
      setInviteEmail('');
      fetchMembers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setInviting(false);
    }
  };

  const copyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inp: React.CSSProperties = { background: '#0d1117', border: '1px solid #1e2330', borderRadius: '8px', padding: '9px 12px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit' };

  return (
    <div style={{ padding: '28px', maxWidth: '680px', margin: '0 auto' }}>
      <h2 style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>Team Members</h2>
      <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 28px' }}>Manage your workspace members and invite new teammates.</p>

      {/* Invite form — owner/manager only */}
      {canInvite && <div style={{ background: '#13161d', border: '1px solid #1e2330', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, margin: '0 0 16px' }}>Invite a teammate</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            placeholder="teammate@company.com"
            type="email"
            style={{ ...inp, flex: 2, minWidth: '200px' }}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            style={{ ...inp, flex: 1, minWidth: '120px' }}
          >
            <option value="member">Member</option>
            <option value="manager">Manager</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={!inviteEmail.trim() || inviting}
            style={{ background: inviteEmail.trim() && !inviting ? '#3b82f6' : '#1e2533', border: 'none', borderRadius: '8px', color: inviteEmail.trim() && !inviting ? '#fff' : '#475569', fontSize: '13px', fontWeight: 600, padding: '9px 18px', cursor: inviteEmail.trim() && !inviting ? 'pointer' : 'default' }}
          >
            {inviting ? 'Sending…' : <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Icons.Send /> Send Invite</span>}
          </button>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: '12px', margin: '10px 0 0' }}>{error}</p>}

        {inviteUrl && (
          <div style={{ marginTop: '12px', background: '#0d1117', border: '1px solid #22c55e33', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#22c55e', fontSize: '12px', flex: 1, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inviteUrl}</span>
            <button onClick={copyLink} style={{ background: copied ? '#22c55e22' : '#1e2533', border: '1px solid #334155', borderRadius: '6px', color: copied ? '#22c55e' : '#94a3b8', fontSize: '11px', padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        )}
      </div>}

      {/* Members list */}
      <div style={{ background: '#13161d', border: '1px solid #1e2330', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a2030', display: 'flex', gap: '12px', color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <span style={{ flex: 1 }}>Member</span>
          <span style={{ width: 80 }}>Role</span>
          <span style={{ width: 100 }}>Joined</span>
        </div>

        {members.length === 0 && (
          <div style={{ padding: '28px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
            {canInvite ? 'No members yet — invite your first teammate above.' : 'No team members found.'}
          </div>
        )}

        {members.map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid #1a2030' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: m.user.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
              {initials(m.user.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{m.user.name}</div>
              <div style={{ color: '#475569', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.user.email}</div>
            </div>
            <span style={{ width: 80, fontSize: '11px', fontWeight: 600, color: ROLE_COLORS[m.role] ?? '#64748b', textTransform: 'capitalize' }}>{m.role}</span>
            <span style={{ width: 100, color: '#475569', fontSize: '11px' }}>{new Date(m.joinedAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
