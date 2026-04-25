import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getFABStyles } from '../../src/styles/components/FABStyles';
import { useTheme } from '../../src/context/ThemeContext';
import { lightColors, darkColors } from '../../src/styles/theme';

export default function TabsLayout() {
  const router = useRouter();
  const { styles } = useThemeStyles(getFABStyles);
  const { isDarkMode, theme: themeMode } = useTheme();

  const isDark    = themeMode === 'dark' || (themeMode === 'system' && isDarkMode);
  const colors    = isDark ? darkColors : lightColors;
  const activeColor   = colors.primary;
  const inactiveColor = colors.textSecondary;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor:   activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor:  colors.border,
            borderTopWidth: 1,
            height: 72,
            paddingBottom: 14,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Takvim',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="pomodoro"
          options={{
            title: 'Odaklanma',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'timer' : 'timer-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: 'İstatistik',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Global FAB — Yeni Görev */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/new-task')}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}
