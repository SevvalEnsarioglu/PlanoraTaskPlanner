import { StyleSheet, Platform } from 'react-native';
import { ThemeColors, spacing, fonts } from '../theme';

export const getHomeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
  },
  
  // Filters
  filterContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  filterPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.isDark ? '#2a1420' : '#F5E6E6', // Soft contrast background
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
  },
  filterTextActive: {
    color: '#ffffff', // Always white on primary
    fontWeight: fonts.weights.bold,
  },

  // FlatList content
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Space for bottom tabs
  },
  
  // Task Card (Soft Shadows / Neumorphism inspired)
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.md,
    overflow: 'hidden', // to keep the indicator clipped if needed
    // Soft shadow
    shadowColor: colors.isDark ? '#000' : colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.isDark ? 0.3 : 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  taskIndicator: {
    width: 6,
    height: '100%',
    backgroundColor: colors.secondary, // Will be overridden by category color dynamically
  },
  checkboxContainer: {
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskContent: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.sm,
  },
  taskTitle: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  taskCategory: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.medium,
    marginBottom: 8,
  },
  
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: colors.isDark ? '#3d1c2a' : '#FDF0F2',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: fonts.weights.medium,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  }
});
