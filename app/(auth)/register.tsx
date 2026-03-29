import { View, Text } from 'react-native';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getRegisterStyles } from '../../src/styles/auth/RegisterStyles';

export default function RegisterScreen() {
  const { styles } = useThemeStyles(getRegisterStyles);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kayıt Ol</Text>
        <Text style={styles.subtitle}>Planora'ya katılarak zamanınızı yönetin.</Text>
      </View>
    </View>
  );
}
