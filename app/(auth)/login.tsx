import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getLoginStyles } from '../../src/styles/auth/LoginStyles';
import { AuthService } from '../../src/services/authService';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { styles } = useThemeStyles(getLoginStyles);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.login({ email, password });
      // @ts-ignore: Expo router route typing issue
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log("Login Error Details:", error);
      const errorMessage = error.response ? 
        (error.response.data?.message || JSON.stringify(error.response.data)) 
        : error.message || 'Giriş yapılamadı.';
        
      Alert.alert('Hata', `Nedeni: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Planora Giriş</Text>
        <Text style={styles.subtitle}>Tekrar hoş geldiniz, görevinize hazır mısınız?</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>E-posta</Text>
        <TextInput
          style={styles.input}
          placeholder="E-posta adresiniz"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Şifre</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={[styles.input, { paddingRight: 50 }]}
            placeholder="Şifreniz"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={{ position: 'absolute', right: 15, top: 15 }} 
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showPassword ? "eye-off" : "eye"} 
              size={20} 
              color="#999" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Hesabınız yok mu?{' '}
        <Link href="/register" asChild>
          <Text style={styles.registerLink}>Kayıt Ol</Text>
        </Link>
      </Text>
    </View>
  );
}
