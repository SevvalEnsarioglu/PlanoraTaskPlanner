import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, TextInput, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeStyles } from '../src/hooks/useThemeStyles';
import { getNewTaskStyles } from '../src/styles/screens/NewTaskStyles';
import { TaskService } from '../src/services/taskService';
import { CategoryService } from '../src/services/categoryService';
import { PriorityService } from '../src/services/priorityService';
import { TagService } from '../src/services/tagService';
import {
  TaskResponseDTO, CategoryResponseDTO,
  PriorityResponseDTO, TagResponseDTO,
} from '../src/types';

export default function TaskDetailScreen() {
  const { taskId, userId: userIdParam } = useLocalSearchParams<{ taskId: string; userId: string }>();
  const { styles, theme } = useThemeStyles(getNewTaskStyles);
  const router = useRouter();

  const userId = userIdParam ? parseInt(userIdParam, 10) : null;

  // ─── State ──────────────────────────────────────────────────────────────────
  const [task, setTask]         = useState<TaskResponseDTO | null>(null);
  const [loading, setLoading]   = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving]     = useState(false);

  // Edit fields
  const [title, setTitle]                       = useState('');
  const [description, setDescription]           = useState('');
  const [dueDate, setDueDate]                   = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponseDTO | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<PriorityResponseDTO | null>(null);
  const [selectedTags, setSelectedTags]         = useState<TagResponseDTO[]>([]);

  // Lists
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [priorities, setPriorities] = useState<PriorityResponseDTO[]>([]);
  const [tags, setTags]             = useState<TagResponseDTO[]>([]);

  // Tarih — düzenlemede manuel giriş
  const [dateText, setDateText] = useState('');

  // ─── Load ──────────────────────────────────────────────────────────────────
  const loadTask = useCallback(async () => {
    if (!taskId || !userId) return;
    try {
      setLoading(true);
      const data = await TaskService.getById(userId, Number(taskId));  // ✅
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || '');
      const existingDate = data.dueDate ? new Date(data.dueDate) : null;
      setDueDate(existingDate);
      if (existingDate) {
        const d = existingDate;
        const day   = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year  = String(d.getFullYear());
        setDateText(`${day}-${month}-${year}`);
      } else {
        setDateText('');
      }
    } catch {
      Alert.alert('Hata', 'Görev yüklenemedi.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [taskId, userId]);

  const loadLists = useCallback(async () => {
    if (!userId) return;
    try {
      const [cats, pris, tgs] = await Promise.all([
        CategoryService.getAll(userId),   // ✅
        PriorityService.getAll(userId),   // ✅
        TagService.getAll(userId),        // ✅
      ]);
      setCategories(cats);
      setPriorities(pris);
      setTags(tgs);
    } catch { /* critical olmayan */ }
  }, [userId]);

  useEffect(() => { loadTask(); loadLists(); }, [loadTask, loadLists]);

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Uyarı', 'Başlık boş bırakılamaz.'); return; }
    if (!userId)        return;
    try {
      setSaving(true);
      await TaskService.update(userId, Number(taskId), {   // ✅
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate?.toISOString(),
        isCompleted: task!.isCompleted,
        categoryId:  selectedCategory?.id,
        priorityId:  selectedPriority?.id,
        tagIds: selectedTags.map(t => t.id),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEditing(false);
      loadTask();
    } catch {
      Alert.alert('Hata', 'Görev güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle Complete ──────────────────────────────────────────────────────
  const handleToggleComplete = async () => {
    if (!task || !userId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await TaskService.update(userId, Number(taskId), {   // ✅
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        isCompleted: !task.isCompleted,
        categoryId:  task.category?.id,
        priorityId:  task.priority?.id,
        tagIds: task.tags?.map(t => t.id) ?? [],
      });
      loadTask();
    } catch {
      Alert.alert('Hata', 'Durum güncellenemedi.');
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!userId) return;
    const doDelete = async () => {
      try {
        await TaskService.delete(userId, Number(taskId));   // ✅
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } catch {
        Alert.alert('Hata', 'Görev silinemedi.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) doDelete();
    } else {
      Alert.alert('Görevi Sil', 'Bu işlem geri alınamaz.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const toggleTag = (tag: TagResponseDTO) => {
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]
    );
  };

  // ─── Tarih Maskeleme ────────────────────────────────────────────────────────
  const handleDateTextChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + '-' + digits.slice(2);
    if (digits.length > 4) formatted = digits.slice(0, 2) + '-' + digits.slice(2, 4) + '-' + digits.slice(4);
    setDateText(formatted);
    if (digits.length === 8) {
      const day   = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      const year  = parseInt(digits.slice(4, 8), 10);
      const d = new Date(year, month - 1, day);
      if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day && year >= 2024) {
        setDueDate(d);
      } else {
        setDueDate(null);
      }
    } else {
      setDueDate(null);
    }
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  if (!task) return null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Düzenle' : 'Görev Detayı'}</Text>
        {isEditing ? (
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator size="small" color={theme.primary} />
              : <Text style={styles.saveText}>Kaydet</Text>
            }
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="pencil" size={21} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={21} color={theme.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {/* Tamamlandı Butonu */}
          <TouchableOpacity
            onPress={handleToggleComplete}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              backgroundColor: task.isCompleted ? theme.success + '15' : theme.surface,
              borderRadius: 14, padding: 16, marginBottom: 20,
              borderWidth: 1.5,
              borderColor: task.isCompleted ? theme.success : theme.border,
            }}
          >
            <View style={{
              width: 26, height: 26, borderRadius: 13,
              borderWidth: 2,
              borderColor: task.isCompleted ? theme.success : theme.border,
              backgroundColor: task.isCompleted ? theme.success : 'transparent',
              justifyContent: 'center', alignItems: 'center',
            }}>
              {task.isCompleted && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: task.isCompleted ? theme.success : theme.text }}>
              {task.isCompleted ? 'Tamamlandı ✓' : 'Tamamlandı olarak işaretle'}
            </Text>
          </TouchableOpacity>

          {/* Başlık */}
          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Görev başlığı"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          ) : (
            <>
              <Text style={{
                fontSize: 22, fontWeight: '700', color: theme.text,
                marginBottom: 4, lineHeight: 30,
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
              }}>{task.title}</Text>
              <View style={{ height: 1, backgroundColor: theme.border, marginBottom: 20 }} />
            </>
          )}

          {/* Açıklama */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Açıklama</Text>
            {isEditing ? (
              <TextInput
                style={styles.descInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Görev açıklaması…"
                placeholderTextColor={theme.textSecondary}
                multiline
              />
            ) : (
              <View style={{ backgroundColor: theme.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.border, minHeight: 56 }}>
                <Text style={{ fontSize: 15, color: description ? theme.text : theme.textSecondary, lineHeight: 22 }}>
                  {description || 'Açıklama eklenmemiş'}
                </Text>
              </View>
            )}
          </View>

          {/* Bitiş Tarihi */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bitiş Tarihi</Text>
            {isEditing ? (
              <View>
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
                    <TouchableOpacity onPress={() => { setDateText(''); setDueDate(null); }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
                {dateText.length === 10 && (
                  <Text style={{ fontSize: 12, marginTop: 4,
                    color: dueDate ? theme.success : theme.error }}>
                    {dueDate
                      ? `✓ ${dueDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}`
                      : '✗ Geçersiz tarih'}
                  </Text>
                )}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.border }}>
                <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
                <Text style={{ fontSize: 15, color: task.dueDate ? theme.text : theme.textSecondary }}>
                  {task.dueDate ? formatDate(new Date(task.dueDate)) : 'Tarih belirlenmemiş'}
                </Text>
              </View>
            )}
          </View>

          {/* Kategori */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Kategori</Text>
              {isEditing && selectedCategory && (
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Text style={styles.clearText}>Temizle</Text>
                </TouchableOpacity>
              )}
            </View>
            {isEditing ? (
              <View style={styles.tagWrap}>
                {categories.map(cat => {
                  const active = selectedCategory?.id === cat.id;
                  const color  = cat.colorCode ?? theme.primary;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCategory(active ? null : cat)}
                      style={[styles.pill, active && { backgroundColor: color + '20', borderColor: color }]}
                    >
                      <View style={[styles.pillDot, { backgroundColor: color }]} />
                      <Text style={[styles.pillText, active && { color, fontWeight: '700' }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {task.category ? (
                  <>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: task.category.colorCode ?? theme.primary }} />
                    <Text style={{ fontSize: 15, color: theme.text }}>{task.category.name}</Text>
                  </>
                ) : <Text style={{ fontSize: 15, color: theme.textSecondary }}>Kategori eklenmemiş</Text>}
              </View>
            )}
          </View>

          {/* Öncelik */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Öncelik</Text>
              {isEditing && selectedPriority && (
                <TouchableOpacity onPress={() => setSelectedPriority(null)}>
                  <Text style={styles.clearText}>Temizle</Text>
                </TouchableOpacity>
              )}
            </View>
            {isEditing ? (
              <View style={styles.tagWrap}>
                {priorities.map(pri => {
                  const active = selectedPriority?.id === pri.id;
                  const color  = pri.colorCode ?? theme.primary;
                  return (
                    <TouchableOpacity
                      key={pri.id}
                      onPress={() => setSelectedPriority(active ? null : pri)}
                      style={[styles.pill, active && { backgroundColor: color + '20', borderColor: color }]}
                    >
                      <View style={[styles.priorityLevelDot, { backgroundColor: color }]}>
                        <Text style={styles.priorityLevelText}>{pri.level}</Text>
                      </View>
                      <Text style={[styles.pillText, active && { color, fontWeight: '700' }]}>{pri.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              task.priority ? (
                <View style={{ alignSelf: 'flex-start', backgroundColor: (task.priority.colorCode ?? theme.primary) + '20', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: task.priority.colorCode ?? theme.primary }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: task.priority.colorCode ?? theme.primary }}>
                    Lv{task.priority.level} · {task.priority.name}
                  </Text>
                </View>
              ) : <Text style={{ fontSize: 15, color: theme.textSecondary }}>Öncelik eklenmemiş</Text>
            )}
          </View>

          {/* Etiketler */}
          <View style={[styles.inputGroup, { marginBottom: 40 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Etiketler</Text>
              {isEditing && selectedTags.length > 0 && (
                <TouchableOpacity onPress={() => setSelectedTags([])}>
                  <Text style={styles.clearText}>Temizle</Text>
                </TouchableOpacity>
              )}
            </View>
            {isEditing ? (
              <View style={styles.tagWrap}>
                {tags.map(tag => {
                  const active = selectedTags.some(t => t.id === tag.id);
                  const color  = tag.colorCode ?? '#8B5CF6';
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      onPress={() => toggleTag(tag)}
                      style={[styles.pill, active && { backgroundColor: color + '20', borderColor: color }]}
                    >
                      <View style={[styles.pillDot, { backgroundColor: color }]} />
                      <Text style={[styles.pillText, active && { color, fontWeight: '700' }]}>#{tag.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {task.tags?.length ? task.tags.map(tag => (
                  <View key={tag.id} style={{ backgroundColor: (tag.colorCode ?? '#8B5CF6') + '18', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: (tag.colorCode ?? '#8B5CF6') + '50' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: tag.colorCode ?? '#8B5CF6' }}>#{tag.name}</Text>
                  </View>
                )) : <Text style={{ fontSize: 15, color: theme.textSecondary }}>Etiket eklenmemiş</Text>}
              </View>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
