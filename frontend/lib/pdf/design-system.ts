import { StyleSheet } from '@react-pdf/renderer';

// Base unit: 4px grid
const u = (n: number) => n * 4;

export const grid = {
  page: { width: 595, height: 842 }, // A4 pts
  margin: { x: u(12), y: u(14) },     // 48px / 56px
  gutter: u(3),                       // 12px
  col: u(18),                         // 72px — 12 columns = 864px, scaled to fit
};

export const colors = {
  // Brand Themes
  red: '#dc2626',
  redBg: '#fef2f2',
  green: '#10b981',
  greenBg: '#ecfdf5',
  blue: '#3b82f6',
  blueBg: '#eff6ff',
  yellow: '#f59e0b',
  yellowBg: '#fffbeb',

  // UI Colors
  forest: '#0a3d2e',
  mint: '#1D9E75',
  ink: '#1a1a1a',
  slate: '#475569',
  silver: '#94a3b8',
  cloud: '#f1f5f9',
  snow: '#ffffff',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  warning: '#d97706',
  warningBg: '#fffbeb',
  success: '#059669',
  successBg: '#ecfdf5',
};

export const type = {
  display: { fontFamily: 'Inter', fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5, color: colors.forest },
  h1: { fontFamily: 'Inter', fontSize: 20, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.3, color: colors.ink },
  h2: { fontFamily: 'Inter', fontSize: 14, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0, color: colors.ink, textTransform: 'uppercase' as const },
  body: { fontFamily: 'Inter', fontSize: 10, fontWeight: 400, lineHeight: 1.6, color: colors.slate },
  bodySmall: { fontFamily: 'Inter', fontSize: 9, fontWeight: 400, lineHeight: 1.5, color: colors.slate },
  caption: { fontFamily: 'Inter', fontSize: 8, fontWeight: 600, lineHeight: 1.4, letterSpacing: 1, color: colors.silver, textTransform: 'uppercase' as const },
  mono: { fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 400, lineHeight: 1.5, color: colors.slate },
};

export const spacing = {
  xs: u(1),   // 4
  sm: u(2),   // 8
  md: u(3),   // 12
  lg: u(4),   // 16
  xl: u(6),   // 24
  '2xl': u(8), // 32
  '3xl': u(12), // 48
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: grid.margin.y,
    paddingBottom: grid.margin.y,
    paddingHorizontal: grid.margin.x,
    fontFamily: 'Inter',
    color: colors.ink,
  },
  
  // Header — fixed height, always present
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.cloud,
  },
  
  headerMeta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  
  // Score badge — refined proportions
  scoreBadge: {
    width: u(20),
    height: u(20),
    borderRadius: u(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: 700,
    color: colors.snow,
  },
  scoreLabel: {
    ...type.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  // Content blocks — tight vertical rhythm
  section: {
    marginBottom: spacing.xl,
  },
  
  // Issue cards — no wasted space
  issueCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  
  issueTag: {
    ...type.caption,
    color: colors.danger,
    fontSize: 7,
  },
  
  issueBody: {
    ...type.bodySmall,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  
  rewriteBlock: {
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: '#fecaca',
  },
  
  rewriteLabel: {
    ...type.caption,
    color: colors.mint,
    fontSize: 7,
    marginBottom: spacing.xs,
  },
  
  rewriteText: {
    ...type.bodySmall,
    color: colors.forest,
    fontStyle: 'italic',
  },
  
  // Footer — minimal, always at bottom
  footer: {
    position: 'absolute',
    bottom: grid.margin.y,
    left: grid.margin.x,
    right: grid.margin.x,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.cloud,
  },
  
  footerText: {
    ...type.caption,
    fontSize: 7,
    color: colors.silver,
  },
});
