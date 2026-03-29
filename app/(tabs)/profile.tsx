import { View, Text } from 'react-native';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getProfileStyles } from '../../src/styles/tabs/ProfileStyles';

export default function ProfileScreen() {
  const { styles } = useThemeStyles(getProfileStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profilim</Text>
    </View>
  );
}
