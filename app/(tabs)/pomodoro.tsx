import { View, Text } from 'react-native';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getPomodoroStyles } from '../../src/styles/tabs/PomodoroStyles';

export default function PomodoroScreen() {
  const { styles } = useThemeStyles(getPomodoroStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pomodoro Sayacı</Text>
    </View>
  );
}
