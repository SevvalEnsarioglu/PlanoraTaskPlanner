import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getHomeStyles } from '../../src/styles/tabs/HomeStyles';
import { TaskService } from '../../src/services/taskService';
import { TaskResponseDTO } from '../../src/types';

export default function HomeScreen() {
  const { styles, theme } = useThemeStyles(getHomeStyles);
  const router = useRouter();

  const [tasks, setTasks]   = useState<TaskResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');

  // ─── UserId yükle ──────────────────────────────────────────────────────────
  const resolveUserId = useCallback(async (): Promise<number | null> => {
    if (userId) return userId;
    const stored = await AsyncStorage.getItem('userId');
    if (!stored) return null;
    const id = parseInt(stored, 10);
    setUserId(id);
    return id;
  }, [userId]);

  // ─── Görevleri Yükle ───────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const uid = await resolveUserId();
      if (!uid) return;
      const data = await TaskService.getAll(uid);   // ✅ doğru metod
      setTasks(data);
    } catch (err) {
      console.error('Görevler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }, [resolveUserId]);

  useFocusEffect(useCallback(() => { fetchTasks(); }, [fetchTasks]));

  // ─── Tamamlandı Toggle ─────────────────────────────────────────────────────
  const toggleTaskCompletion = async (task: TaskResponseDTO) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const uid = await resolveUserId();
      if (!uid) return;
      await TaskService.update(uid, task.id, {   // ✅ doğru metod
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        isCompleted: !task.isCompleted,
        categoryId: task.category?.id,
        priorityId: task.priority?.id,
        tagIds: task.tags?.map(t => t.id) ?? [],
      });
      fetchTasks();
    } catch {
      Alert.alert('Hata', 'Görev durumu güncellenemedi.');
    }
  };

  // ─── Filtre ────────────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    const today = new Date().toISOString().split('T')[0];
    const taskDay = t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '';
    if (filter === 'today')    return taskDay === today;
    if (filter === 'upcoming') return taskDay > today;
    return true;
  });

  // ─── Kart ──────────────────────────────────────────────────────────────────
  const renderTaskItem = ({ item }: { item: TaskResponseDTO }) => {
    const isCompleted = item.isCompleted;
    const accentColor = item.priority?.colorCode ?? theme.primary;
    const priColor    = item.priority?.colorCode ?? theme.primary;
    const catColor    = item.category?.colorCode ?? theme.textSecondary;
    const hasMeta = !!(item.category || item.priority || item.tags?.length);

    return (
      <TouchableOpacity
        style={[styles.taskCard, { borderLeftWidth: 4, borderLeftColor: accentColor }]}
        onPress={() => router.push({ pathname: '/task-detail', params: { taskId: item.id, userId } })}
        activeOpacity={0.80}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleTaskCompletion(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.checkbox, isCompleted && styles.checkboxActive]}>
            {isCompleted && <Ionicons name="checkmark" size={13} color="#FFF" />}
          </View>
        </TouchableOpacity>

        {/* İçerik */}
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]} numberOfLines={2}>
            {item.title}
          </Text>

          {hasMeta && (
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
              {/* Kategori */}
              {item.category && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: catColor }} />
                  <Text style={{ fontSize: 12, color: catColor, fontWeight: '500' }}>{item.category.name}</Text>
                </View>
              )}
              {item.category && (item.priority || item.tags?.length) ? (
                <Text style={{ fontSize: 12, color: theme.textSecondary, opacity: 0.4 }}>·</Text>
              ) : null}
              {/* Öncelik */}
              {item.priority && (
                <View style={{ backgroundColor: priColor + '18', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: priColor }}>{item.priority.name}</Text>
                </View>
              )}
              {item.priority && item.tags?.length ? (
                <Text style={{ fontSize: 12, color: theme.textSecondary, opacity: 0.4 }}>·</Text>
              ) : null}
              {/* Etiketler */}
              {item.tags?.map(tag => (
                <Text key={tag.id} style={{ fontSize: 11, fontWeight: '500', color: tag.colorCode ?? theme.textSecondary }}>
                  #{tag.name}
                </Text>
              ))}
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={15} color={theme.textSecondary} style={{ opacity: 0.35, marginLeft: 4 }} />
      </TouchableOpacity>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Merhaba 👋</Text>
        <Text style={styles.title}>Bugün Neler Var?</Text>
      </View>

      {/* Filtre Bar */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 8 }}>
        {(['all', 'today', 'upcoming'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Hepsi' : f === 'today' ? 'Bugün' : 'Gelecek'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cafe-outline" size={64} color={theme.border} />
              <Text style={styles.emptyText}>Henüz bir görev yok 🎉</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
