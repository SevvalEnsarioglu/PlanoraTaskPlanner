import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors, spacing } from '../theme';

const { width } = Dimensions.get('window');
export const TIMER_SIZE = width * 0.75; // slightly larger for elegance

export const getPomodoroStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    paddingTop: spacing.xxl + 30, // push down from top edge
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32, // larger
    fontWeight: '800', // bolder
    color: colors.text,
    letterSpacing: -0.5,
  },
  taskSelector: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: 20,
    marginBottom: spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border + '40', // very subtle border
  },
  taskSelectorLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskSelectorValue: {
    fontSize: 17,
    color: colors.text,
    fontWeight: '700',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: TIMER_SIZE,
    marginTop: spacing.md,
    marginBottom: spacing.xxl * 2,
  },
  timerCircleContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 76,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  timeSubText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl, // more gap
  },
  controlButtonPrimary: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#5252ff', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5252ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  controlButtonSecondary: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: '50%',
    maxHeight: '85%',
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  taskItem: {
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  taskItemActive: {
    borderColor: '#5252ff',
    backgroundColor: '#5252ff08',
  },
  taskItemTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  taskItemCategory: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xxl,
    fontSize: 16,
  }
});
