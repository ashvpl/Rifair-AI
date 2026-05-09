import { StyleSheet } from '@react-pdf/renderer';
import { fonts } from './fonts';

// Brand colors
export const colors = {
  primary: '#0a3d2e',
  accent: '#1D9E75',
  text: '#1a1a1a',
  textLight: '#666666',
  textMuted: '#999999',
  border: '#e5e5e5',
  background: '#f8f8f8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const styles = StyleSheet.create({
  // Page
  page: {
    padding: 40,
    paddingTop: 48,
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.text,
  },

  // Typography
  h1: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  h3: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.textLight,
  },
  caption: {
    fontSize: 8,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 9,
    backgroundColor: colors.background,
    padding: spacing.xs,
    borderRadius: 4,
  },

  // Layout
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  col: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  box: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginVertical: spacing.sm,
  },

  // Score badge
  scoreBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 700,
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: 8,
    color: '#ffffff',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Status indicators
  statusGood: {
    backgroundColor: '#ecfdf5',
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  statusWarning: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  statusDanger: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },

  // Table
  table: {
    marginVertical: spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 8,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },
  footerLogo: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.primary,
    fontFamily: fonts.mono,
  },
});
