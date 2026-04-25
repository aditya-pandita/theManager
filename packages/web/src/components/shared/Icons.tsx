export const Icons = {
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="7" y1="2" x2="7" y2="12" /><line x1="2" y1="7" x2="12" y2="7" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="3" x2="11" y2="11" /><line x1="11" y1="3" x2="3" y2="11" />
    </svg>
  ),
  Arrow: ({ dir }: { dir: 'left' | 'right' }) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none' }}>
      <path d="M4 2 L8 6 L4 10" />
    </svg>
  ),
  Code: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 3L2 7L5 11" /><path d="M9 3L12 7L9 11" />
    </svg>
  ),
  Chat: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2h10v7H5L2 12V2z" />
    </svg>
  ),
  History: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="5" /><path d="M7 4v3l2 2" />
    </svg>
  ),
  Image: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="2" width="12" height="10" rx="1" /><circle cx="4.5" cy="5.5" r="1.5" />
      <path d="M1 10l3-3 2 2 3-4 4 5" />
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2l12 6-12 6V9l8-1-8-1V2z" />
    </svg>
  ),
  Sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" />
    </svg>
  ),
  Brain: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M7 13V7" />
      <path d="M7 7C7 4.5 5 2.5 3.5 2.5C2 2.5 1 3.5 1 5C1 6 1.5 6.5 1.5 6.5" />
      <path d="M1.5 6.5C1 7 1 8 1.5 9C2 10 3.5 10.5 5 10" />
      <path d="M7 7C7 4.5 9 2.5 10.5 2.5C12 2.5 13 3.5 13 5C13 6 12.5 6.5 12.5 6.5" />
      <path d="M12.5 6.5C13 7 13 8 12.5 9C12 10 10.5 10.5 9 10" />
    </svg>
  ),
  ChevDown: () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3.5L5 6.5L8 3.5" />
    </svg>
  ),
  ChevRight: () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3.5 2L6.5 5L3.5 8" />
    </svg>
  ),
  Check: () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 5L4 7L8 3" />
    </svg>
  ),
  Ban: () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="5" cy="5" r="4" /><line x1="2.2" y1="2.2" x2="7.8" y2="7.8" />
    </svg>
  ),
  BarChart: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="8" width="3" height="5" /><rect x="5.5" y="5" width="3" height="8" />
      <rect x="10" y="2" width="3" height="11" />
    </svg>
  ),
  Flow: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h4v2H2z" />
      <path d="M8 4h4v2H8z" />
      <path d="M4 8h6v2H4z" />
      <path d="M2 4l2 2" />
      <path d="M6 6l2 2" />
      <path d="M10 6l-2 2" />
    </svg>
  ),
  Zap: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1L3 8h4l-1 5 6-7H8l1-5z" />
    </svg>
  ),
  Git: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7h5c1.5 0 2.5-1 2.5-2.5S9.5 2 8 2H3" />
      <path d="M3 12h2c1.5 0 2.5-1 2.5-2.5S6.5 7 5 7H3" />
      <circle cx="10.5" cy="4.5" r="1.5" />
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="4.5" r="2.5" />
      <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5" />
    </svg>
  ),
};
