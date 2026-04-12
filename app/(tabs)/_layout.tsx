import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getFABStyles } from '../../src/styles/components/FABStyles';

export default function TabsLayout() {
  const router = useRouter();
  const { styles, theme } = useThemeStyles(getFABStyles);

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={{ headerShown: true }}>
        <Tabs.Screen name="home" options={{ title: 'Ana Sayfa' }} />
        <Tabs.Screen name="calendar" options={{ title: 'Takvim' }} />
        <Tabs.Screen name="pomodoro" options={{ title: 'Odaklanma' }} />
        <Tabs.Screen name="statistics" options={{ title: 'İstatistik' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      </Tabs>
      
      {/* Global FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => router.push('/new-task')}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}
