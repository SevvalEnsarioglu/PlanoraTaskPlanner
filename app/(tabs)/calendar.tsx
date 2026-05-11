import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';

import { useThemeStyles } from '../../src/hooks/useThemeStyles';
import { getCalendarStyles } from '../../src/styles/tabs/CalendarStyles';
import { TaskService } from '../../src/services/taskService';
import { TaskResponseDTO } from '../../src/types';

// Türkçe lokalizasyon ayarları
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

export default function CalendarScreen() {
  const router = useRouter();
  const { styles, theme } = useThemeStyles(getCalendarStyles);

  const [userId, setUserId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to today
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('userId');
      if (!stored) return;
      const uid = parseInt(stored, 10);
      setUserId(uid);
      setLoading(true);
      const allTasks = await TaskService.getAll(uid);
      setTasks(allTasks);
    } catch {
      Alert.alert('Hata', 'Görevler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // markedDates oluşturulması
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // Her bir görev için noktaları belirle
    tasks.forEach(t => {
      if (!t.dueDate) return;
      const dateStr = t.dueDate.split('T')[0]; // YYYY-MM-DD
      const color = t.priority?.colorCode || theme.primary;
      
      if (!marks[dateStr]) {
        marks[dateStr] = { dots: [] };
      }
      
      // Aynı gün içinde en fazla 3 nokta gösterelim (çok kalabalık olmasın)
      if (marks[dateStr].dots.length < 3) {
        // Eğer aynı renkte nokta yoksa ekle (opsiyonel: her görev için nokta ekle)
        marks[dateStr].dots.push({ key: t.id.toString(), color: color });
      }
      marks[dateStr].marked = true; // dot göstermek için
    });

    // Seçili günü ekle
    if (marks[selectedDate]) {
      marks[selectedDate] = { 
        ...marks[selectedDate], 
        selected: true, 
        selectedColor: theme.primary,
        disableTouchEvent: true
      };
    } else {
      marks[selectedDate] = { 
        selected: true, 
        selectedColor: theme.primary,
        disableTouchEvent: true
      };
    }

    // Bugünün stili
    if (selectedDate !== todayStr) {
       if (marks[todayStr]) {
           marks[todayStr].today = true;
       } else {
           marks[todayStr] = { today: true };
       }
    }

    return marks;
  }, [tasks, selectedDate, theme.primary, todayStr]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      return t.dueDate.startsWith(selectedDate);
    });
  }, [tasks, selectedDate]);

  const onDayPress = (day: DateData) => {
    Haptics.selectionAsync();
    setSelectedDate(day.dateString);
  };

  const toggleTaskCompletion = async (task: TaskResponseDTO) => {
    if (!userId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));

    try {
      await TaskService.update(userId, task.id, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        isCompleted: !task.isCompleted,
        categoryId: task.category?.id,
        priorityId: task.priority?.id,
        tagIds: task.tags?.map(t => t.id) ?? [],
      });
    } catch {
      // Revert if failed
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t));
      Alert.alert('Hata', 'Durum güncellenemedi.');
    }
  };

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
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleTaskCompletion(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.checkbox, isCompleted && styles.checkboxActive]}>
            {isCompleted && <Ionicons name="checkmark" size={13} color="#FFF" />}
          </View>
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]} numberOfLines={2}>
            {item.title}
          </Text>

          {hasMeta && (
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
              {item.category && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: catColor }} />
                  <Text style={{ fontSize: 12, color: catColor, fontWeight: '500' }}>{item.category.name}</Text>
                </View>
              )}
              {item.category && (item.priority || item.tags?.length) ? (
                <Text style={{ fontSize: 12, color: theme.textSecondary, opacity: 0.4 }}>·</Text>
              ) : null}
              {item.priority && (
                <View style={{ backgroundColor: priColor + '18', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: priColor }}>{item.priority.name}</Text>
                </View>
              )}
              {item.priority && item.tags?.length ? (
                <Text style={{ fontSize: 12, color: theme.textSecondary, opacity: 0.4 }}>·</Text>
              ) : null}
              {item.tags?.map(tag => (
                <Text key={tag.id} style={{ fontSize: 11, fontWeight: '500', color: tag.colorCode ?? theme.textSecondary }}>
                  #{tag.name}
                </Text>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-clear-outline" size={48} color={theme.border} />
      <Text style={styles.emptyTitle}>Görev Yok</Text>
      <Text style={styles.emptySubtext}>Seçtiğiniz tarih ({selectedDate}) için herhangi bir görev bulunmuyor.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Takvim</Text>
      </View>

      <View style={styles.calendarWrapper}>
        <Calendar
          current={todayStr}
          onDayPress={onDayPress}
          markingType={'multi-dot'}
          markedDates={markedDates}
          theme={{
            backgroundColor: theme.surface,
            calendarBackground: theme.surface,
            textSectionTitleColor: theme.textSecondary,
            selectedDayBackgroundColor: theme.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: theme.primary,
            dayTextColor: theme.text,
            textDisabledColor: theme.border,
            dotColor: theme.primary,
            selectedDotColor: '#ffffff',
            arrowColor: theme.primary,
            monthTextColor: theme.text,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 15,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
            todayButtonTextColor: theme.primary,
          }}
          firstDay={1} // Pazartesi
          enableSwipeMonths={true}
        />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.selectedDateText}>
          {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
        </Text>
        
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTaskItem}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
}
