import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashLogo from '../assets/images/splash-icon.svg';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await SplashScreen.hideAsync();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(auth)/login');
        }
      } catch {
        router.replace('/(auth)/login');
      }
    };

    init();
  }, []);

  return (
    <View style={styles.container}>
      <SplashLogo width={220} height={220} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
