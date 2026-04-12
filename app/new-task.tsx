import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  
  // Selections
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // Fetched Data
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [priorities, setPriorities] = useState<PriorityResponseDTO[]>([]);
  const [tags, setTags] = useState<TagResponseDTO[]>([]);

  // UI State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const [cats, pris, tgs] = await Promise.all([
        CategoryService.getAll(),
        PriorityService.getAll(),
        TagService.getAll()
      ]);
      setCategories(cats);
      setPriorities(pris);
      setTags(tgs);
      
      // Auto-select first priority and category to reduce friction
      if (pris.length > 0) setSelectedPriority(pris[0].id);
      if (cats.length > 0) setSelectedCategory(cats[0].id);

    } catch (error) {
      console.error('Dependencies Error:', error);
      Alert.alert('Hata', 'Kategori ve etiketler yüklenirken hata oluştu.');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleToggleTag = (tagId: number) => {
    Haptics.selectionAsync();
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Eksik Alan', 'Lütfen bir görev başlığı girin.');
      return;
    }

    try {
      setIsSaving(true);
      const userIdStr = await AsyncStorage.getItem('userId');
      if (!userIdStr) throw new Error("Kullanıcı ID bulunamadı.");

      await TaskService.create(Number(userIdStr), {
        title,
        description,
        dueDate: dueDate.toISOString(), // Backend expects ISO string
        categoryId: selectedCategory || undefined,
        priorityId: selectedPriority || undefined,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back(); // Geri dön (Modal kapat)
    } catch (error) {
      console.error('Save task error:', error);
      Alert.alert('Kayıt Hatası', 'Görev oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDueDate(currentDate);
  };

  if (loadingInitial) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Görev</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving || !title.trim()}>
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Text style={[styles.saveText, !title.trim() && styles.saveTextDisabled]}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title & Description */}
        <TextInput
          style={styles.titleInput}
          placeholder="Görev Başlığı..."
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          autoFocus={true}
        />
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={styles.descInput}
            placeholder="Görev detayları..."
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Due Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tarih & Saat</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            <Text style={styles.dateText}>
              {dueDate.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={dueDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Categroy (Pills) */}
        {categories.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={`cat-${cat.id}`}
                  style={[styles.pill, selectedCategory === cat.id && styles.pillActive]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedCategory(cat.id); }}
                >
                  <Text style={[styles.pillText, selectedCategory === cat.id && styles.pillTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Priorities (Pills) */}
        {priorities.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Öncelik</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillContainer}>
              {priorities.map(pri => (
                <TouchableOpacity
                  key={`pri-${pri.id}`}
                  style={[styles.pill, selectedPriority === pri.id && styles.pillActive]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPriority(pri.id); }}
                >
                  <Text style={[styles.pillText, selectedPriority === pri.id && styles.pillTextActive]}>
                    {pri.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tags (Multi-select Pills) */}
        {tags.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Etiketler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillContainer}>
              {tags.map(tag => {
                const isActive = selectedTags.includes(tag.id);
                return (
                  <TouchableOpacity
                    key={`tag-${tag.id}`}
                    style={[styles.pill, isActive && styles.pillActive]}
                    onPress={() => handleToggleTag(tag.id)}
                  >
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                      #{tag.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
        
        {/* Bottom spacer for scrollability */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
