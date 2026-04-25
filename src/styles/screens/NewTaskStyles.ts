import { StyleSheet, Platform } from 'react-native';
import { ThemeColors, spacing, fonts } from '../theme';

export const getNewTaskStyles = (colors: ThemeColors) => StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ─── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
    width: 36,
  },
  saveText: {
    color: colors.primary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
  },
  saveTextDisabled: {
    color: colors.textSecondary,
    opacity: 0.45,
  },

  // ─── Scroll Content ───────────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // ─── Title Input ──────────────────────────────────────────────────────────
  titleInput: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },

  // ─── Input Group ──────────────────────────────────────────────────────────
  inputGroup: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  clearText: {
    fontSize: fonts.sizes.xs,
    color: colors.primary,
    fontWeight: fonts.weights.medium,
  },

  // ─── Description Input ────────────────────────────────────────────────────
  descInput: {
    fontSize: fonts.sizes.md,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 90,
    textAlignVertical: 'top',
  },

  // ─── Date Button ──────────────────────────────────────────────────────────
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  dateText: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },

  // ─── Empty State Pill ─────────────────────────────────────────────────────
  emptyPillMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  emptyPillText: {
    flex: 1,
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },

  // ─── Pills Container ──────────────────────────────────────────────────────
  // ⚠️  tagWrap'te flexDirection:'row' + flexWrap:'wrap' gerekiyor.
  // ⚠️  Her pill'in alignSelf:'flex-start' olması gerekiyor —
  //      yoksa flex-stretch ile tam genişliği doldurur!
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // ─── Single Pill ──────────────────────────────────────────────────────────
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',       // ← CRITICAL: pill kendi içeriği kadar geniş olur
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
  },

  // ─── Color Dot (kategori / etiket) ───────────────────────────────────────
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ─── Priority Level Badge (küçük daire) ───────────────────────────────────
  priorityLevelDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,                  // ← genişlemeyi engelle
  },
  priorityLevelText: {
    fontSize: 10,
    fontWeight: fonts.weights.bold,
    color: '#FFF',
    lineHeight: 12,
  },

  // ─── iOS Date Picker Modal ────────────────────────────────────────────────
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.40)',
    justifyContent: 'flex-end',
  },
  dateModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  dateModalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateModalTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
  },
  dateModalBtn: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
  },
});
