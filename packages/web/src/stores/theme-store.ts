import { create } from 'zustand';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'decidr.theme';

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage?.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  // Respect system preference on first visit
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  return prefersLight ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  document.body.dataset.theme = theme;
}

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => {
  const initial = readInitialTheme();
  applyTheme(initial);

  return {
    theme: initial,
    setTheme: (theme) => {
      try { window.localStorage?.setItem(STORAGE_KEY, theme); } catch {}
      applyTheme(theme);
      set({ theme });
    },
    toggle: () => {
      const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(next);
    },
  };
});
