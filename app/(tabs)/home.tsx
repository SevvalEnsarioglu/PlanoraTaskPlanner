import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';

import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getHomeStyles } from '../../src/styles/tabs/HomeStyles';
import { TaskService, TaskFilters } from '../../src/services/taskService';
import { TaskResponseDTO } from '../../src/types';

const FILTERS = [
  { id: 'ALL', label: 'Tümü' },
  { id: 'TODAY', label: 'Bugün' },
  { id: 'UPCOMING', label: 'Yaklaşan' },
  { id: 'COMPLETED', label: 'Tamamlanan' },
];

export default function HomeScreen() {
  const { styles, theme } = useThemeStyles(getHomeStyles);
  const [activeFilter, setActiveFilter] = useState('TODAY');
  const [tasks, setTasks] = useState<TaskResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  // Initialize
  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => {
      if (id) setUserId(parseInt(id, 10));
    });
  }, []);

  // Fetch Tasks
  const fetchTasks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let filters: TaskFilters = {};
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      switch(activeFilter) {
        case 'TODAY':
          filters = { date: todayStr };
          break;
        case 'UPCOMING':
          filters = { startDate: tomorrowStr };
          break;
        case 'COMPLETED':
          filters = { completed: true };
          break;
      }
      
      const data = await TaskService.getAll(userId, filters);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Hata', 'Görevler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userId) fetchTasks();
    }, [userId, activeFilter])
  );

  const toggleTaskCompletion = async (task: TaskResponseDTO) => {
    if (!userId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Optimistic Update
    const updatedTasks = tasks.map(t => 
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);

    try {
      await TaskService.complete(userId, task.id, !task.completed);
      
      // Kendi filtresini bozuyorsa listeden kaldırabiliriz veya durabilir. Durması animasyonu görmek için daha iyi.
    } catch (error) {
      // Revert if failed
      setTasks(tasks);
      Alert.alert('Hata', 'Görev durumu güncellenemedi.');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'Tünaydın';
    return 'İyi Akşamlar';
  };

  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.greeting}>{getGreeting()}, Şevval</Text>
      <Text style={styles.title}>Görevlerin</Text>
      <Text style={styles.dateText}>{formattedDate}</Text>
    </View>
  );

  const renderFilters = () => (
    <View style={{ height: 60 }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        data={FILTERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isActive = activeFilter === item.id;
          return (
            <TouchableOpacity
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => {
                setActiveFilter(item.id);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderTaskItem = ({ item }: { item: TaskResponseDTO }) => {
    const isCompleted = item.completed;
    return (
      <View style={styles.taskCard}>
        <View style={[styles.taskIndicator, { backgroundColor: theme.primary }]} />
        
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => toggleTaskCompletion(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isCompleted && styles.checkboxActive]}>
            {isCompleted && <Ionicons name="checkmark" size={16} color={theme.surface} />}
          </View>
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.taskCategory}>
            {item.categoryId ? `Kategori ID: ${item.categoryId}` : 'Kategorisiz'}
          </Text>
          
          <View style={styles.tagsContainer}>
            {item.tagIds && item.tagIds.map(tagId => (
              <View key={tagId} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tagId}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilters()}

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={renderTaskItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={64} color={theme.textSecondary} />
              <Text style={styles.emptyText}>Bu filtreye uygun görev bulunamadı.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
