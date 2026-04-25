import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import { useThemeStyles } from '../src/hooks/useThemeStyles';
import { getSettingsStyles } from '../src/styles/screens/SettingsStyles';
import { CategoryService } from '../src/services/categoryService';
import { PriorityService } from '../src/services/priorityService';
import { TagService } from '../src/services/tagService';
import { CategoryResponseDTO, PriorityResponseDTO, TagResponseDTO } from '../src/types';

const COLOR_OPTIONS = [
  '#EF4444','#F97316','#EAB308','#22C55E','#10B981',
  '#06B6D4','#3B82F6','#8B5CF6','#EC4899','#850E35',
  '#EE6983','#F59E0B','#6B7280','#78716C','#A8A29E',
];

export default function SettingsScreen() {
  const { styles, theme } = useThemeStyles(getSettingsStyles);
  const router = useRouter();

  const [userId, setUserId]     = useState<number | null>(null);
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [priorities, setPriorities] = useState<PriorityResponseDTO[]>([]);
  const [tags, setTags]             = useState<TagResponseDTO[]>([]);
  const [loading, setLoading]       = useState(true);

  // ─── Kategori Form ────────────────────────────────────────────────────────
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName]         = useState('');
  const [catColor, setCatColor]       = useState(COLOR_OPTIONS[0]);
  const [savingCat, setSavingCat]     = useState(false);

  // ─── Öncelik Form ─────────────────────────────────────────────────────────
  const [showPriForm, setShowPriForm] = useState(false);
  const [priName, setPriName]         = useState('');
  const [priColor, setPriColor]       = useState(COLOR_OPTIONS[2]);
  const [priLevel, setPriLevel]       = useState(1);
  const [savingPri, setSavingPri]     = useState(false);

  // ─── Etiket Form ──────────────────────────────────────────────────────────
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagName, setTagName]         = useState('');
  const [tagColor, setTagColor]       = useState(COLOR_OPTIONS[6]);
  const [savingTag, setSavingTag]     = useState(false);

  // ─── Veri Yükle ───────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('userId');
      if (!stored) return;
      const uid = parseInt(stored, 10);
      setUserId(uid);
      setLoading(true);
      const [cats, pris, tgs] = await Promise.all([
        CategoryService.getAll(uid),   // ✅
        PriorityService.getAll(uid),   // ✅
        TagService.getAll(uid),        // ✅
      ]);
      setCategories(cats);
      setPriorities(pris);
      setTags(tgs);
    } catch {
      Alert.alert('Hata', 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // ─── Onaylı Silme ─────────────────────────────────────────────────────────
  const confirmDelete = (label: string, onConfirm: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'web') {
      if (window.confirm(`"${label}" silinsin mi?`)) onConfirm();
    } else {
      Alert.alert('Emin misiniz?', `"${label}" kalıcı olarak silinecek.`, [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: onConfirm },
      ]);
    }
  };

  // ─── Kategori CRUD ────────────────────────────────────────────────────────
  const handleAddCategory = async () => {
    if (!catName.trim() || !userId) return;
    try {
      setSavingCat(true);
      await CategoryService.create(userId, { name: catName.trim(), colorCode: catColor });
      setCatName(''); setCatColor(COLOR_OPTIONS[0]); setShowCatForm(false);
      loadData();
    } catch { Alert.alert('Hata', 'Kategori eklenemedi.'); }
    finally { setSavingCat(false); }
  };

  const handleDeleteCategory = (cat: CategoryResponseDTO) => {
    if (!userId) return;
    confirmDelete(cat.name, async () => {
      try {
        await CategoryService.delete(userId, cat.id);  // ✅
        loadData();
      } catch { Alert.alert('Hata', 'Kategori silinemedi.'); }
    });
  };

  // ─── Öncelik CRUD ─────────────────────────────────────────────────────────
  const handleAddPriority = async () => {
    if (!priName.trim() || !userId) return;
    try {
      setSavingPri(true);
      await PriorityService.create(userId, { name: priName.trim(), colorCode: priColor, level: priLevel });
      setPriName(''); setPriColor(COLOR_OPTIONS[2]); setPriLevel(1); setShowPriForm(false);
      loadData();
    } catch { Alert.alert('Hata', 'Öncelik eklenemedi.'); }
    finally { setSavingPri(false); }
  };

  const handleDeletePriority = (pri: PriorityResponseDTO) => {
    if (!userId) return;
    confirmDelete(pri.name, async () => {
      try {
        await PriorityService.delete(userId, pri.id);  // ✅
        loadData();
      } catch { Alert.alert('Hata', 'Öncelik silinemedi.'); }
    });
  };

  // ─── Etiket CRUD ──────────────────────────────────────────────────────────
  const handleAddTag = async () => {
    if (!tagName.trim() || !userId) return;
    try {
      setSavingTag(true);
      await TagService.create(userId, { name: tagName.trim(), colorCode: tagColor });
      setTagName(''); setTagColor(COLOR_OPTIONS[6]); setShowTagForm(false);
      loadData();
    } catch { Alert.alert('Hata', 'Etiket eklenemedi.'); }
    finally { setSavingTag(false); }
  };

  const handleDeleteTag = (tag: TagResponseDTO) => {
    if (!userId) return;
    confirmDelete(tag.name, async () => {
      try {
        await TagService.delete(userId, tag.id);  // ✅
        loadData();
      } catch { Alert.alert('Hata', 'Etiket silinemedi.'); }
    });
  };

  // ─── Renk Seçici ──────────────────────────────────────────────────────────
  const ColorPicker = ({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) => (
    <View style={styles.colorGrid}>
      {COLOR_OPTIONS.map(c => (
        <TouchableOpacity
          key={c}
          style={[styles.colorOption, { backgroundColor: c }, c === selected && styles.colorOptionSelected]}
          onPress={() => onSelect(c)}
        />
      ))}
    </View>
  );

  if (loading) {
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ══ KATEGORİLER ══════════════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => { setShowCatForm(f => !f); Haptics.selectionAsync(); }}>
            <Ionicons name={showCatForm ? 'close' : 'add'} size={16} color="#FFF" />
            <Text style={styles.addButtonText}>{showCatForm ? 'İptal' : 'Ekle'}</Text>
          </TouchableOpacity>
        </View>

        {showCatForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Yeni Kategori</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad</Text>
              <TextInput style={[styles.input, { color: theme.text }]}
                value={catName} onChangeText={setCatName}
                placeholder="Kategori adı…" placeholderTextColor={theme.textSecondary} />
            </View>
            <Text style={styles.colorPickerLabel}>Renk</Text>
            <ColorPicker selected={catColor} onSelect={setCatColor} />
            <View style={styles.formButtonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCatForm(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddCategory} disabled={savingCat}>
                {savingCat ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {categories.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={32} color={theme.border} />
            <Text style={styles.emptyText}>Henüz kategori yok</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {categories.map((cat, i) => (
              <View key={cat.id} style={[styles.itemRow, i === categories.length - 1 && styles.itemRowLast]}>
                <View style={[styles.colorDot, { backgroundColor: cat.colorCode ?? theme.primary }]} />
                <Text style={styles.itemName}>{cat.name}</Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteCategory(cat)}>
                  <Ionicons name="trash-outline" size={18} color={theme.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ══ ÖNCELİKLER ══════════════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Öncelikler</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => { setShowPriForm(f => !f); Haptics.selectionAsync(); }}>
            <Ionicons name={showPriForm ? 'close' : 'add'} size={16} color="#FFF" />
            <Text style={styles.addButtonText}>{showPriForm ? 'İptal' : 'Ekle'}</Text>
          </TouchableOpacity>
        </View>

        {showPriForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Yeni Öncelik</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad</Text>
              <TextInput style={[styles.input, { color: theme.text }]}
                value={priName} onChangeText={setPriName}
                placeholder="Öncelik adı…" placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Seviye</Text>
              <View style={styles.levelRow}>
                {[1,2,3,4,5].map(l => (
                  <TouchableOpacity key={l}
                    style={[styles.levelOption, priLevel === l && styles.levelOptionSelected]}
                    onPress={() => setPriLevel(l)}>
                    <Text style={[styles.levelOptionText, priLevel === l && styles.levelOptionTextSelected]}>Lv{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Text style={styles.colorPickerLabel}>Renk</Text>
            <ColorPicker selected={priColor} onSelect={setPriColor} />
            <View style={styles.formButtonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPriForm(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddPriority} disabled={savingPri}>
                {savingPri ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {priorities.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="flag-outline" size={32} color={theme.border} />
            <Text style={styles.emptyText}>Henüz öncelik yok</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {priorities.map((pri, i) => (
              <View key={pri.id} style={[styles.itemRow, i === priorities.length - 1 && styles.itemRowLast]}>
                <View style={[styles.levelBadge, { backgroundColor: pri.colorCode ?? theme.primary }]}>
                  <Text style={styles.levelBadgeText}>Lv{pri.level}</Text>
                </View>
                <Text style={styles.itemName}>{pri.name}</Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeletePriority(pri)}>
                  <Ionicons name="trash-outline" size={18} color={theme.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ══ ETİKETLER ════════════════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Etiketler</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => { setShowTagForm(f => !f); Haptics.selectionAsync(); }}>
            <Ionicons name={showTagForm ? 'close' : 'add'} size={16} color="#FFF" />
            <Text style={styles.addButtonText}>{showTagForm ? 'İptal' : 'Ekle'}</Text>
          </TouchableOpacity>
        </View>

        {showTagForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Yeni Etiket</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad</Text>
              <TextInput style={[styles.input, { color: theme.text }]}
                value={tagName} onChangeText={setTagName}
                placeholder="Etiket adı…" placeholderTextColor={theme.textSecondary} />
            </View>
            <Text style={styles.colorPickerLabel}>Renk</Text>
            <ColorPicker selected={tagColor} onSelect={setTagColor} />
            <View style={styles.formButtonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowTagForm(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddTag} disabled={savingTag}>
                {savingTag ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {tags.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="pricetag-outline" size={32} color={theme.border} />
            <Text style={styles.emptyText}>Henüz etiket yok</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {tags.map((tag, i) => (
              <View key={tag.id} style={[styles.itemRow, i === tags.length - 1 && styles.itemRowLast]}>
                <View style={[styles.colorDot, { backgroundColor: tag.colorCode ?? '#8B5CF6' }]} />
                <Text style={styles.itemName}>#{tag.name}</Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteTag(tag)}>
                  <Ionicons name="trash-outline" size={18} color={theme.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}
