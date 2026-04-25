import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  width?: number | string;
}

export function Modal({ onClose, children, width = 540 }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '16px', width, maxHeight: '88vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', color: 'var(--text)' }}
      >
        {children}
      </div>
    </div>
  );
}
