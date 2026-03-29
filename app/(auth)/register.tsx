import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getRegisterStyles } from '../../src/styles/auth/RegisterStyles';
import { AuthService } from '../../src/services/authService';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { styles } = useThemeStyles(getRegisterStyles);
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !name || !surname || !email || !phoneNumber || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.register({ username, name, surname, email, phoneNumber, password });
      Alert.alert('Başarılı', 'Kayıt işleminiz başarıyla gerçekleşti! Şimdi giriş yapabilirsiniz.', [
        { text: 'Tamam', onPress: () => router.push('/login') }
      ]);
    } catch (error: any) {
      console.log("Register Error Details:", error);
      const errorMessage = error.response ? 
        (error.response.data?.message || JSON.stringify(error.response.data)) 
        : error.message || 'Kayıt işlemi sırasında bir hata oluştu.';
        
      Alert.alert('Hata', `Nedeni: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Kayıt Ol</Text>
          <Text style={styles.subtitle}>Planora'ya katılarak zamanınızı yönetin.</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Ad"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Soyad"
            placeholderTextColor="#999"
            value={surname}
            onChangeText={setSurname}
          />

          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefon Numarası"
            placeholderTextColor="#999"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, { paddingRight: 50 }]}
              placeholder="Şifre"
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

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Zaten hesabınız var mı?{' '}
            <Link href="/login" asChild>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
