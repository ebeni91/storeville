export const theme = {
  colors: {
    // aligned with frontend/app/globals.css + utility classes
    background: '#f8fafc',
    foreground: '#0f172a',
    primary: '#4f46e5',
    primaryPressed: '#4338ca',
    card: '#ffffff',
    border: '#e2e8f0',
    mutedText: '#475569',
    danger: '#dc2626'
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24
  },
  radius: {
    md: 12,
    lg: 16,
    xl: 20
  },
  text: {
    title: 24,
    subtitle: 16,
    body: 14,
    small: 12
  }
} as const;
