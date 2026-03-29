import { View, Text } from 'react-native';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getStatisticsStyles } from '../../src/styles/tabs/StatisticsStyles';

export default function StatisticsScreen() {
  const { styles } = useThemeStyles(getStatisticsStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>İstatistiklerim</Text>
    </View>
  );
}
