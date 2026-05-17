import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  FlatList, Alert, Dimensions, SafeAreaView,
  TextInput, Pressable, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import { useTheme } from '../../src/context/ThemeContext';
import { lightColors, darkColors } from '../../src/styles/theme';
import { TaskService } from '../../src/services/taskService';
import { PomodoroService } from '../../src/services/pomodoroService';
import { TaskResponseDTO } from '../../src/types';

const { width } = Dimensions.get('window');
const RING_SIZE   = width * 0.72;
const STROKE      = 10;
const RADIUS      = (RING_SIZE - STROKE) / 2;
const CIRCUMF     = 2 * Math.PI * RADIUS;
const DEFAULT_MIN = 25;

type Phase = 'idle' | 'running' | 'paused';

export default function PomodoroScreen() {
  const { isDarkMode, theme: themeMode } = useTheme();
  const isDark  = themeMode === 'dark' || (themeMode === 'system' && isDarkMode);
  const colors  = isDark ? darkColors : lightColors;
  const BLUE    = '#4F46E5';

  const [userId, setUserId] = useState<number | null>(null);

  const [tasks,         setTasks]         = useState<TaskResponseDTO[]>([]);
  const [selectedTask,  setSelectedTask]  = useState<TaskResponseDTO | null>(null);
  const [modalVisible,  setModalVisible]  = useState(false);

  const [phase,           setPhase]           = useState<Phase>('idle');
  const [timeLeft,        setTimeLeft]        = useState(DEFAULT_MIN * 60);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_MIN); // kullanıcı seçimi
  const [editingDuration, setEditingDuration] = useState(false);
  const [editInput,       setEditInput]       = useState('');

  const phaseRef    = useRef<Phase>('idle');
  const timeLeftRef = useRef(DEFAULT_MIN * 60);
  const taskRef     = useRef<TaskResponseDTO | null>(null);
  const userIdRef   = useRef<number | null>(null);
  const startedAtRef= useRef<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setPhaseSync = (p: Phase) => { phaseRef.current = p;   setPhase(p); };
  const setTimeSync  = (t: number) => { timeLeftRef.current = t; setTimeLeft(t); };

  const totalSec = durationMinutes * 60;

  useEffect(() => {
    AsyncStorage.getItem('userId').then(v => {
      if (v) { const id = parseInt(v, 10); userIdRef.current = id; setUserId(id); }
    });
  }, []);

  const fetchTasks = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    try {
      const data = await TaskService.getAll(uid, { completed: false });
      setTasks(data);
    } catch (e) { console.error('Görevler yüklenemedi', e); }
  }, []);

  useEffect(() => {
    if (phase === 'idle') {
      timeLeftRef.current = totalSec;
      setTimeLeft(totalSec);
    }
  }, [durationMinutes]);

  useFocusEffect(useCallback(() => { fetchTasks(); }, [fetchTasks]));

  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(() => {
        const next = timeLeftRef.current - 1;
        setTimeSync(next);
        if (next <= 0) finishSession(false);
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  const saveSession = async (workedSec: number) => {
    const uid  = userIdRef.current;
    const task = taskRef.current;
    if (!uid || !task) return;

    const workedMin = Math.max(1, Math.round(workedSec / 60));
    const endTime   = new Date();
    const startTime = startedAtRef.current ?? new Date(endTime.getTime() - workedMin * 60_000);

    await PomodoroService.create(uid, {
      taskId:            task.id,
      durationInMinutes: workedMin,
      startTime:         startTime.toISOString(),
      endTime:           endTime.toISOString(),
    });
    return workedMin;
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhaseSync('idle');
    setTimeSync(totalSec);
    startedAtRef.current = null;
  };

  const finishSession = useCallback((manual: boolean) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhaseSync('idle');

    const elapsed = totalSec - timeLeftRef.current;

    if (elapsed < 60 && manual) {
      Alert.alert('Çok Kısa', 'En az 1 dakika çalışmalısınız.');
      setPhaseSync('idle');
      setTimeSync(totalSec);
      return;
    }

    saveSession(elapsed)
      .then(min => {
        if (min) Alert.alert('Tebrikler! 🎉', `${min} dk odaklanma süresi kaydedildi.`);
        taskRef.current = null;
        setSelectedTask(null);
        setTimeSync(totalSec);
        startedAtRef.current = null;
      })
      .catch(() => Alert.alert('Hata', 'Süre kaydedilirken bir sorun oluştu.'));
  }, []);

  const handleStart = () => {
    if (!taskRef.current) {
      Alert.alert('Görev Seçin', 'Lütfen önce bir görev seçin.');
      return;
    }
    startedAtRef.current = startedAtRef.current ?? new Date();
    setPhaseSync('running');
  };

  const handlePause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhaseSync('paused');
  };

  const handleStop = () => {
    const elapsed = totalSec - timeLeftRef.current;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhaseSync('idle');

    if (elapsed < 60) {
      Alert.alert('Çok Kısa', 'En az 1 dakika çalışmalısınız.');
      setTimeSync(totalSec);
      startedAtRef.current = null;
      return;
    }

    const uid  = userIdRef.current;
    const task = taskRef.current;
    if (!uid || !task) { resetTimer(); return; }

    const workedMin = Math.max(1, Math.round(elapsed / 60));
    const endTime   = new Date();
    const startTime = startedAtRef.current ?? new Date(endTime.getTime() - workedMin * 60_000);

    PomodoroService.create(uid, {
      taskId:            task.id,
      durationInMinutes: workedMin,
      startTime:         startTime.toISOString(),
      endTime:           endTime.toISOString(),
    })
      .then(() => {
        Alert.alert('Kaydedildi ✅', `${workedMin} dk odaklanma süresi kaydedildi.`);
        taskRef.current = null;
        setSelectedTask(null);
        setTimeSync(totalSec);
        startedAtRef.current = null;
      })
      .catch(() => {
        Alert.alert('Hata', 'Süre kaydedilirken bir sorun oluştu.');
        resetTimer();
      });
  };

  const handleDurationDoubleTap = () => {
    if (phase !== 'idle') return; // sayaç çalışırken değiştirilemez
    setEditInput(String(durationMinutes));
    setEditingDuration(true);
  };

  const applyDuration = () => {
    const parsed = parseInt(editInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 120) {
      setDurationMinutes(parsed);
    } else {
      Alert.alert('Geçersiz Süre', '1 ile 120 dakika arasında bir değer girin.');
    }
    setEditingDuration(false);
    Keyboard.dismiss();
  };

  const pickTask = (task: TaskResponseDTO) => {
    taskRef.current = task;
    setSelectedTask(task);
    setModalVisible(false);
  };

  const progress   = timeLeft / totalSec;  // 1→0
  const dashOffset = CIRCUMF * progress;   // full→0

  const formatTime = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 20 }}>

        {/* Header */}
        <Text style={{ fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: 24 }}>
          Pomodoro
        </Text>

        {/* Task Card */}
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={phase === 'running'}
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            marginBottom: 32,
            borderWidth: 1.5,
            borderColor: selectedTask ? BLUE + '55' : colors.border,
            shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 3,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>
            Şu an çalışılıyor
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: selectedTask ? colors.text : colors.textSecondary, flex: 1, marginRight: 8 }} numberOfLines={1}>
              {selectedTask ? selectedTask.title : 'Bir görev seçin...'}
            </Text>
            {phase !== 'running' && (
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            )}
          </View>
          {selectedTask?.category && (
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              {selectedTask.category.name}
            </Text>
          )}
        </TouchableOpacity>

        {/* Ring Timer */}
        <View style={{ alignItems: 'center', justifyContent: 'center', height: RING_SIZE, marginBottom: 40 }}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Track */}
            <Circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
              stroke={isDark ? '#2A2A3A' : '#EEF0F8'}
              strokeWidth={STROKE} fill="none"
            />
            {/* Progress */}
            <Circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
              stroke={phase === 'idle' ? colors.border : BLUE}
              strokeWidth={STROKE} fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMF} ${CIRCUMF}`}
              strokeDashoffset={dashOffset}
              rotation="-90" origin={`${RING_SIZE / 2},${RING_SIZE / 2}`}
            />
          </Svg>
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            {/* Çift tıkla → süreyi düzenle (sadece idle) */}
            <Pressable onPress={phase === 'idle' ? handleDurationDoubleTap : undefined} delayLongPress={0}>
              <Text
                style={{
                  fontSize: 68, fontWeight: '700', color: colors.text,
                  fontVariant: ['tabular-nums'], letterSpacing: -2,
                  textDecorationLine: phase === 'idle' ? 'none' : 'none',
                }}
              >
                {formatTime(timeLeft)}
              </Text>
            </Pressable>
            <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginTop: 4 }}>
              {phase === 'idle'
                ? 'Düzenlemek için çift tıkla'
                : phase === 'paused' ? 'Duraklatıldı'
                : 'Odaklanma zamanı'}
            </Text>
          </View>
        </View>

        {/* Controls — 3 buton her zaman sabit konumda */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 }}>

          {/* Sol: Kırmızı Stop — kaydet & bitir */}
          <TouchableOpacity
            onPress={handleStop}
            disabled={phase === 'idle'}
            style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: phase !== 'idle' ? colors.error + '66' : colors.border,
              justifyContent: 'center', alignItems: 'center',
              opacity: phase === 'idle' ? 0.35 : 1,
              shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 }, elevation: 2,
            }}
          >
            <Ionicons name="stop" size={22} color={colors.error} />
          </TouchableOpacity>

          {/* Orta: Play / Pause */}
          <TouchableOpacity
            onPress={phase === 'running' ? handlePause : handleStart}
            style={{
              width: 88, height: 88, borderRadius: 44,
              backgroundColor: BLUE,
              justifyContent: 'center', alignItems: 'center',
              shadowColor: BLUE, shadowOpacity: 0.4,
              shadowRadius: 18, shadowOffset: { width: 0, height: 10 },
              elevation: 12,
            }}
          >
            <Ionicons
              name={phase === 'running' ? 'pause' : 'play'}
              size={38} color="#FFF"
              style={{ marginLeft: phase !== 'running' ? 4 : 0 }}
            />
          </TouchableOpacity>

          {/* Sağ: Sıfırla */}
          <TouchableOpacity
            onPress={resetTimer}
            disabled={phase === 'idle'}
            style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: colors.surface,
              borderWidth: 1.5, borderColor: colors.border,
              justifyContent: 'center', alignItems: 'center',
              opacity: phase === 'idle' ? 0.35 : 1,
              shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 }, elevation: 2,
            }}
          >
            <Ionicons name="refresh" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

        </View>

      </View>

      {/* Task Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
          activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View
            onStartShouldSetResponder={() => true}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 32, borderTopRightRadius: 32,
              minHeight: '55%', maxHeight: '85%', padding: 28,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Görev Seç</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={26} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {tasks.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 16 }}>
                Aktif göreviniz bulunmuyor.
              </Text>
            ) : (
              <FlatList
                data={tasks}
                keyExtractor={t => t.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const active = selectedTask?.id === item.id;
                  return (
                    <TouchableOpacity
                      onPress={() => pickTask(item)}
                      activeOpacity={0.75}
                      style={{
                        padding: 18, borderRadius: 16, marginBottom: 10,
                        backgroundColor: active ? BLUE + '12' : colors.background,
                        borderWidth: 1.5,
                        borderColor: active ? BLUE : colors.border,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                          {item.title}
                        </Text>
                        {item.category && (
                          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3, fontWeight: '500' }}>
                            {item.category.name}
                          </Text>
                        )}
                      </View>
                      {active && <Ionicons name="checkmark-circle" size={22} color={BLUE} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Süre Düzenleme Modalı */}
      <Modal visible={editingDuration} transparent animationType="fade" onRequestClose={() => setEditingDuration(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => { setEditingDuration(false); Keyboard.dismiss(); }}
        >
          <Pressable
            onPress={() => {}} // içeri tıklamayı yakala, modalı kapama
            style={{
              backgroundColor: colors.surface,
              borderRadius: 28, padding: 32, width: '80%',
              shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 }, elevation: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 }}>
              Süreyi Ayarla
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 24 }}>
              1 – 120 dakika arasında bir değer girin
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              {/* Azalt */}
              <TouchableOpacity
                onPress={() => setEditInput(v => String(Math.max(1, parseInt(v || '1', 10) - 5)))}
                style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border,
                  justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>

              {/* Giriş Alanı */}
              <TextInput
                value={editInput}
                onChangeText={setEditInput}
                keyboardType="number-pad"
                maxLength={3}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={applyDuration}
                style={{
                  fontSize: 48, fontWeight: '700', color: colors.text,
                  textAlign: 'center', width: 100,
                  borderBottomWidth: 2, borderBottomColor: BLUE,
                  paddingBottom: 4,
                }}
              />

              {/* Artır */}
              <TouchableOpacity
                onPress={() => setEditInput(v => String(Math.min(120, parseInt(v || '0', 10) + 5)))}
                style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border,
                  justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Hızlı seçim */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[15, 25, 30, 45, 60].map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setEditInput(String(m))}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: editInput === String(m) ? BLUE : colors.background,
                    borderWidth: 1.5,
                    borderColor: editInput === String(m) ? BLUE : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: editInput === String(m) ? '#FFF' : colors.text }}>
                    {m} dk
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Onayla */}
            <TouchableOpacity
              onPress={applyDuration}
              style={{
                width: '100%', paddingVertical: 14, borderRadius: 16,
                backgroundColor: BLUE, alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>Uygula</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}
