import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Switch, Alert, ActivityIndicator, Modal,
  TextInput, Platform, KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getProfileStyles } from '../../src/styles/tabs/ProfileStyles';
import { AuthService } from '../../src/services/authService';
import { StatisticsService } from '../../src/services/statisticsService';
import { UserResponseDTO, StatisticsResponseDTO } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';

// ─── İkon renk konfigürasyonu ────────────────────────────────────────────────
const MENU_ICONS: Record<string, { bg: string; darkBg: string; icon: string; color: string }> = {
  darkmode:      { bg: '#FFF3D9', darkBg: '#33270A', icon: 'moon',           color: '#F5A623' },
  notifications: { bg: '#D5F5E3', darkBg: '#0D2E1A', icon: 'notifications', color: '#27AE60' },
  settings:      { bg: '#EDE0F3', darkBg: '#2D1A40', icon: 'settings',       color: '#7C6FD8' },
};

const formatPomodoroHours = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}dk`;
  if (m === 0) return `${h}s`;
  return `${h}s ${m}dk`;
};

// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { styles, theme } = useThemeStyles(getProfileStyles);
  const { theme: currentThemeMode, setTheme, isDarkMode } = useTheme();
  const router = useRouter();

  const [user, setUser]   = useState<UserResponseDTO | null>(null);
  const [stats, setStats] = useState<StatisticsResponseDTO | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Edit Modal
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName]     = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editPhone, setEditPhone]   = useState('');
  const [isSaving, setIsSaving]     = useState(false);

  // ─── Veri Yükleme ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await AuthService.me();
      setUser(userData);
      const resolvedId = userId ?? userData.id;
      if (resolvedId) {
        setUserId(resolvedId);
        await AsyncStorage.setItem('userId', String(resolvedId));
        try {
          const statsData = await StatisticsService.getStatistics(resolvedId);
          setStats(statsData);
        } catch {
          // İstatistik isteğe bağlı
        }
      }
    } catch {
      Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      // Bildirim tercihini de yükle
      AsyncStorage.getItem('notificationsEnabled').then(val => {
        setNotificationsEnabled(val !== 'false');
      });
    }, [loadData])
  );

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'web') {
      if (window.confirm('Hesabınızdan çıkmak istediğinize emin misiniz?')) {
        AuthService.logout().then(() => router.replace('/(auth)/login'));
      }
      return;
    }
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap', style: 'destructive',
        onPress: async () => {
          await AuthService.logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const openEditModal = () => {
    if (!user) return;
    setEditName(user.name);
    setEditSurname(user.surname);
    setEditPhone(user.phoneNumber || '');
    setEditModalVisible(true);
    Haptics.selectionAsync();
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editSurname.trim()) {
      Alert.alert('Uyarı', 'Ad ve soyad boş bırakılamaz.');
      return;
    }
    try {
      setIsSaving(true);
      const updated = await AuthService.updateProfile({
        name: editName.trim(),
        surname: editSurname.trim(),
        phoneNumber: editPhone.trim() || undefined,
      });
      setUser(updated);
      setEditModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDarkMode = (val: boolean) => {
    Haptics.selectionAsync();
    setTheme(val ? 'dark' : 'light');
  };

  const toggleNotifications = async (val: boolean) => {
    Haptics.selectionAsync();
    setNotificationsEnabled(val);
    await AsyncStorage.setItem('notificationsEnabled', val ? 'true' : 'false');
  };

  const getInitials = () => {
    if (!user) return 'P';
    return `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase();
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const isDark = currentThemeMode === 'dark' || (currentThemeMode === 'system' && isDarkMode);

  // ─── Render yardımcısı ────────────────────────────────────────────────────
  const renderMenuRow = (
    key: keyof typeof MENU_ICONS,
    label: string,
    right: React.ReactNode,
    onPress?: () => void,
    isLast = false,
  ) => {
    const cfg = MENU_ICONS[key];
    const bgColor = isDark ? cfg.darkBg : cfg.bg;
    return (
      <TouchableOpacity
        style={[styles.menuRow, isLast && styles.menuRowLast]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
      >
        <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
          <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        {right}
      </TouchableOpacity>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Sayfa Başlığı */}
        <Text style={styles.pageTitle}>Profil</Text>

        {/* ── Kullanıcı Hero Kartı ─────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{user?.name} {user?.surname}</Text>
            <Text style={styles.heroEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.heroEditBtn} onPress={openEditModal} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Menü Kartı ───────────────────────── */}
        <View style={styles.menuCard}>
          {renderMenuRow(
            'darkmode', 'Karanlık Mod',
            <Switch value={isDark} onValueChange={toggleDarkMode}
              trackColor={{ false: theme.border, true: theme.primary }} thumbColor={'#FFF'} />,
          )}
          {renderMenuRow(
            'notifications', 'Bildirimler',
            <Switch value={notificationsEnabled} onValueChange={toggleNotifications}
              trackColor={{ false: theme.border, true: '#3B82F6' }} thumbColor={'#FFF'} />,
          )}
          {renderMenuRow(
            'settings', 'Ayarlar',
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />,
            () => router.push('/settings'),
            true,
          )}
        </View>

        {/* ── Özet İstatistikler ───────────────── */}
        {stats && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Bu Ayın Özeti</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#7C6FD8' }]}>{stats.totalCompletedTasks}</Text>
                <Text style={styles.statLabel}>Tamamlanan</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#F5A623' }]}>
                  {formatPomodoroHours(stats.totalPomodoroMinutes)}
                </Text>
                <Text style={styles.statLabel}>Odak Süresi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#27AE60' }]}>
                  {stats.pendingTasks}
                </Text>
                <Text style={styles.statLabel}>Bekleyen</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Çıkış Yap ────────────────────────── */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={theme.error} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Profil Düzenleme Modal ────────────── */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setEditModalVisible(false)} />
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad</Text>
              <TextInput style={[styles.input, { color: theme.text }]}
                value={editName} onChangeText={setEditName}
                placeholder="Adınız" placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Soyad</Text>
              <TextInput style={[styles.input, { color: theme.text }]}
                value={editSurname} onChangeText={setEditSurname}
                placeholder="Soyadınız" placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefon</Text>
              <TextInput style={[styles.input, { color: theme.text }]}
                value={editPhone} onChangeText={setEditPhone}
                placeholder="+90 5XX XXX XX XX" placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad" />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={isSaving} activeOpacity={0.8}>
              {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Kaydet</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
