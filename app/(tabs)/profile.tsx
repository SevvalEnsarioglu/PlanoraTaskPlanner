import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Modal, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getProfileStyles } from '../../src/styles/tabs/ProfileStyles';
import { AuthService } from '../../src/services/authService';
import { UserResponseDTO } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';

export default function ProfileScreen() {
  const { styles, theme } = useThemeStyles(getProfileStyles);
  const { theme: currentThemeMode, setTheme } = useTheme();
  const router = useRouter();

  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await AuthService.me();
      setUser(userData);
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Hesabınızdan çıkmak istediğinize emin misiniz?')) {
        await AuthService.logout();
        router.replace('/(auth)/login');
      }
    } else {
      Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış', 
          style: 'destructive',
          onPress: async () => {
             await AuthService.logout();
             router.replace('/(auth)/login');
          }
        }
      ]);
    }
  };

  const openEditModal = () => {
    if (user) {
      setEditName(user.name);
      setEditSurname(user.surname);
      setEditPhone(user.phoneNumber || '');
      setEditModalVisible(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedUser = await AuthService.updateProfile({
        name: editName,
        surname: editSurname,
        phoneNumber: editPhone
      });
      setUser(updatedUser);
      setEditModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (!user) return 'P';
    return `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase();
  };

  const toggleTheme = (val: boolean) => {
    Haptics.selectionAsync();
    // Simplified toggle: between light and dark (ignoring system after manual choice for persistence)
    setTheme(val ? 'dark' : 'light');
  };

  if (loading || !user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header / Hero */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.nameText}>{user.name} {user.surname}</Text>
          <Text style={styles.usernameText}>@{user.username}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.sectionTitleHeader}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="pencil" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.listItem}>
            <View style={styles.listIconContainer}>
              <Ionicons name="mail" size={20} color={theme.secondary} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listLabel}>E-posta</Text>
              <Text style={styles.listValue}>{user.email}</Text>
            </View>
          </View>
          <View style={[styles.listItem, styles.listItemNoBorder]}>
            <View style={styles.listIconContainer}>
              <Ionicons name="call" size={20} color={theme.secondary} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listLabel}>Telefon</Text>
              <Text style={styles.listValue}>{user.phoneNumber || 'Belirtilmedi'}</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.sectionTitleHeader}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>
        </View>
        <View style={styles.card}>
          <View style={[styles.listItem, styles.listItemNoBorder]}>
            <View style={styles.listIconContainer}>
              <Ionicons name="moon" size={20} color={theme.secondary} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listValue}>Karanlık Mod (Dark Mode)</Text>
            </View>
            <Switch 
              value={currentThemeMode === 'dark' || (currentThemeMode === 'system' && theme.isDark)}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={24} color={theme.error} />
          <Text style={styles.logoutText}>Hesaptan Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Soyad</Text>
              <TextInput style={styles.input} value={editSurname} onChangeText={setEditSurname} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefon Numarası</Text>
              <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
            </View>

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Kaydet</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
