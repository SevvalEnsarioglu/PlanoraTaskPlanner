import { View, Text } from 'react-native';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getHomeStyles } from '../../src/styles/tabs/HomeStyles';

export default function HomeScreen() {
  const { styles } = useThemeStyles(getHomeStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Görevlerim</Text>
    </View>
  );
}
