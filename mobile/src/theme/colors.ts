// ─── Light Theme ──────────────────────────────────────────────────────────────
export const lightColors = {
  bg:           '#f8fafc',
  surface:      '#ffffff',
  surfaceAlt:   '#f3f4f6',
  border:       '#e5e7eb',
  borderStrong: '#d1d5db',
  text:         '#111827',
  textSub:      '#4b5563',
  textMuted:    '#9ca3af',
  accent:       '#111827',
  accentFaint:  '#f3f4f6',
  accentText:   '#111827',
  danger:       '#ef4444',
  dangerFaint:  '#fff1f2',
  dangerBorder: '#fecdd3',
  tabPill:      '#ffffff',
  tabBorder:    'rgba(0,0,0,0.09)',
  tabIcon:      '#b8bcc8',
  tabIconFocus: '#1a1a2e',
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────
export const darkColors = {
  bg:           '#050508',
  surface:      '#0f0f14',
  surfaceAlt:   '#16161e',
  border:       'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  text:         '#ffffff',
  textSub:      'rgba(255,255,255,0.55)',
  textMuted:    'rgba(255,255,255,0.28)',
  accent:       '#ffffff',
  accentFaint:  'rgba(255,255,255,0.15)',
  accentText:   '#ffffff',
  danger:       '#f87171',
  dangerFaint:  'rgba(239,68,68,0.12)',
  dangerBorder: 'rgba(239,68,68,0.25)',
  tabPill:      'rgba(22,22,30,0.92)',
  tabBorder:    'rgba(255,255,255,0.15)',
  tabIcon:      'rgba(255,255,255,0.35)',
  tabIconFocus: '#ffffff',
};

export type AppColors = typeof lightColors;
