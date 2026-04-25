import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { useThemeStyles } from '../src/hooks/useThemeStyles';
import { getNewTaskStyles } from '../src/styles/screens/NewTaskStyles';
import { TaskService } from '../src/services/taskService';
import { CategoryService } from '../src/services/categoryService';
import { PriorityService } from '../src/services/priorityService';
import { TagService } from '../src/services/tagService';
import { CategoryResponseDTO, PriorityResponseDTO, TagResponseDTO } from '../src/types';

export default function NewTaskScreen() {
  const router = useRouter();
  const { styles, theme } = useThemeStyles(getNewTaskStyles);

  // ─── Form State ────────────────────────────────────────────────────────────
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate]       = useState<Date | null>(null);

  // ─── Selections ────────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponseDTO | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<PriorityResponseDTO | null>(null);
  const [selectedTags, setSelectedTags]         = useState<TagResponseDTO[]>([]);

  // ─── Fetched Data ──────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [priorities, setPriorities] = useState<PriorityResponseDTO[]>([]);
  const [tags, setTags]             = useState<TagResponseDTO[]>([]);

  // ─── UI State ──────────────────────────────────────────────────────────────
  const [userId, setUserId]           = useState<number | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSaving, setSaving]         = useState(false);
  // Manuel tarih girişi — "GG-AA-YYYY" formatında
  const [dateText, setDateText] = useState('');

  // ─── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const idStr = await AsyncStorage.getItem('userId');
        if (!idStr) { Alert.alert('Hata', 'Oturum bulunamadı.'); router.back(); return; }
        const uid = parseInt(idStr, 10);
        setUserId(uid);

        // ✅ userId ile doğru endpoint'ler
        const [cats, pris, tgs] = await Promise.all([
          CategoryService.getAll(uid),
          PriorityService.getAll(uid),
          TagService.getAll(uid),
        ]);
        setCategories(cats);
        setPriorities(pris);
        setTags(tgs);
      } catch (err) {
        console.error('Bağımlılık yükleme hatası:', err);
        Alert.alert('Hata', 'Veriler yüklenemedi.');
      } finally {
        setLoadingInitial(false);
      }
    })();
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  // ─── Tarih Maskeleme ────────────────────────────────────────────────────────
  // 1, 2 rakam → gün; 3,4 → ay; 5-8 → yıl. Tireler otomatik eklenir.
  const handleDateTextChange = (raw: string) => {
    // Sadece rakamları al
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + '-' + digits.slice(2);
    if (digits.length > 4) formatted = digits.slice(0, 2) + '-' + digits.slice(2, 4) + '-' + digits.slice(4);
    setDateText(formatted);

    // 8 rakam girildiğinde Date'e çevir
    if (digits.length === 8) {
      const day   = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      const year  = parseInt(digits.slice(4, 8), 10);
      const d = new Date(year, month - 1, day);
      if (
        d.getFullYear() === year &&
        d.getMonth() === month - 1 &&
        d.getDate() === day &&
        year >= 2024
      ) {
        setDueDate(d);
      } else {
        setDueDate(null);
      }
    } else {
      setDueDate(null);
    }
  };

  const toggleTag = (tag: TagResponseDTO) => {
    Haptics.selectionAsync();
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Eksik Alan', 'Lütfen bir başlık girin.'); return; }
    if (!userId)       { Alert.alert('Hata', 'Kullanıcı bulunamadı.');           return; }

    try {
      setSaving(true);
      await TaskService.create(userId, {   // ✅ doğru metod
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate?.toISOString(),
        isCompleted: false,                // ✅ NOT NULL hatası giderildi
        categoryId:  selectedCategory?.id,
        priorityId:  selectedPriority?.id,
        tagIds: selectedTags.length > 0 ? selectedTags.map(t => t.id) : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      console.error('Görev kayıt hatası:', err);
      Alert.alert('Kayıt Hatası', 'Görev oluşturulamadı. Tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loadingInitial) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Görev</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving || !title.trim()}>
          {isSaving
            ? <ActivityIndicator size="small" color={theme.primary} />
            : <Text style={[styles.saveText, !title.trim() && styles.saveTextDisabled]}>Kaydet</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Başlık */}
        <TextInput
          style={styles.titleInput}
          placeholder="Görev başlığı…"
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        {/* Açıklama */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={styles.descInput}
            placeholder="İsteğe bağlı açıklama…"
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Bitiş Tarihi — Manuel Giriş */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bitiş Tarihi</Text>
          <View style={[styles.dateButton, { gap: 10 }]}>
            <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.dateText, { flex: 1, padding: 0, margin: 0 }]}
              value={dateText}
              onChangeText={handleDateTextChange}
              placeholder="GG-AA-YYYY"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              maxLength={10}
              returnKeyType="done"
            />
            {dateText.length > 0 && (
              <TouchableOpacity
                onPress={() => { setDateText(''); setDueDate(null); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          {/* Geçerlilik göstergesi */}
          {dateText.length === 10 && (
            <Text style={{ fontSize: 12, marginTop: 4,
              color: dueDate ? theme.success : theme.error }}>
              {dueDate
                ? `✓ ${dueDate.toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric', weekday:'long' })}`
                : '✗ Geçersiz tarih'}
            </Text>
          )}
        </View>

        {/* Kategori */}
        <View style={styles.inputGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Kategori</Text>
            {selectedCategory && (
              <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                <Text style={styles.clearText}>Temizle</Text>
              </TouchableOpacity>
            )}
          </View>

          {categories.length === 0 ? (
            <View style={styles.emptyPillMsg}>
              <Ionicons name="folder-open-outline" size={18} color={theme.textSecondary} />
              <Text style={styles.emptyPillText}>Ayarlar'dan kategori ekleyin</Text>
            </View>
          ) : (
            <View style={styles.tagWrap}>
              {categories.map(cat => {
                const active = selectedCategory?.id === cat.id;
                const color  = cat.colorCode ?? theme.primary;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => { Haptics.selectionAsync(); setSelectedCategory(active ? null : cat); }}
                    style={[
                      styles.pill,
                      active && { backgroundColor: color + '20', borderColor: color },
                    ]}
                  >
                    <View style={[styles.pillDot, { backgroundColor: color }]} />
                    <Text style={[styles.pillText, active && { color, fontWeight: '700' }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Öncelik */}
        <View style={styles.inputGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Öncelik</Text>
            {selectedPriority && (
              <TouchableOpacity onPress={() => setSelectedPriority(null)}>
                <Text style={styles.clearText}>Temizle</Text>
              </TouchableOpacity>
            )}
          </View>

          {priorities.length === 0 ? (
            <View style={styles.emptyPillMsg}>
              <Ionicons name="flag-outline" size={18} color={theme.textSecondary} />
              <Text style={styles.emptyPillText}>Ayarlar'dan öncelik ekleyin</Text>
            </View>
          ) : (
            <View style={styles.tagWrap}>
              {priorities.map(pri => {
                const active = selectedPriority?.id === pri.id;
                const color  = pri.colorCode ?? theme.primary;
                return (
                  <TouchableOpacity
                    key={pri.id}
                    onPress={() => { Haptics.selectionAsync(); setSelectedPriority(active ? null : pri); }}
                    style={[
                      styles.pill,
                      active && { backgroundColor: color + '20', borderColor: color },
                    ]}
                  >
                    <View style={[styles.priorityLevelDot, { backgroundColor: color }]}>
                      <Text style={styles.priorityLevelText}>{pri.level}</Text>
                    </View>
                    <Text style={[styles.pillText, active && { color, fontWeight: '700' }]}>
                      {pri.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Etiketler */}
        <View style={[styles.inputGroup, { marginBottom: 60 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Etiketler</Text>
            {selectedTags.length > 0 && (
              <TouchableOpacity onPress={() => setSelectedTags([])}>
                <Text style={styles.clearText}>Temizle</Text>
              </TouchableOpacity>
            )}
          </View>

          {tags.length === 0 ? (
            <View style={styles.emptyPillMsg}>
              <Ionicons name="pricetag-outline" size={18} color={theme.textSecondary} />
              <Text style={styles.emptyPillText}>Ayarlar'dan etiket ekleyin</Text>
            </View>
          ) : (
            <View style={styles.tagWrap}>
              {tags.map(tag => {
                const active = selectedTags.some(t => t.id === tag.id);
                const color  = tag.colorCode ?? '#8B5CF6';
                return (
                  <TouchableOpacity
                    key={tag.id}
                    onPress={() => toggleTag(tag)}
                    style={[
                      styles.pill,
                      active && { backgroundColor: color + '20', borderColor: color },
                    ]}
                  >
                    <View style={[styles.pillDot, { backgroundColor: color }]} />
                    <Text style={[styles.pillText, active && { color, fontWeight: '700' }]}>
                      #{tag.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>

    </View>
  );
}
