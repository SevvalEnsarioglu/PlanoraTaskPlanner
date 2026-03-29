import { View, Text } from 'react-native';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getCalendarStyles } from '../../src/styles/tabs/CalendarStyles';

export default function CalendarScreen() {
  const { styles } = useThemeStyles(getCalendarStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Takvim Görünümü</Text>
    </View>
  );
}
