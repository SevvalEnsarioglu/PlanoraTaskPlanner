import { View, Text } from 'react-native';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getLoginStyles } from '../../src/styles/auth/LoginStyles';

export default function LoginScreen() {
  const { styles } = useThemeStyles(getLoginStyles);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Planora Giriş</Text>
        <Text style={styles.subtitle}>Tekrar hoş geldiniz, görevinize hazır mısınız?</Text>
      </View>
    </View>
  );
}
