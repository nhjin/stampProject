import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StampCell, type StampCellState } from '@/components/StampCell';
import { Colors } from '@/constants/colors';
import { GRID_COLUMNS } from '@/constants/layout';
import { Strings } from '@/constants/strings';
import { daysInMonth, isFutureDate, makeDateKey, todayKey } from '@/lib/dates';
import { toAbsoluteUri } from '@/lib/images';
import { useStampStore } from '@/store/useStampStore';

const BOARD_PADDING = 16;

interface MonthCursor {
  year: number;
  month: number; // 1~12
}

export default function BoardScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();

  const [cursor, setCursor] = useState<MonthCursor>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const stampsByDate = useStampStore((s) => s.stampsByDate);
  const loadMonth = useStampStore((s) => s.loadMonth);

  useEffect(() => {
    loadMonth(cursor.year, cursor.month);
  }, [cursor, loadMonth]);

  const moveMonth = useCallback((delta: number) => {
    setCursor((prev) => {
      const base = new Date(prev.year, prev.month - 1 + delta, 1);
      return { year: base.getFullYear(), month: base.getMonth() + 1 };
    });
  }, []);

  const days = useMemo(
    () => Array.from({ length: daysInMonth(cursor.year, cursor.month) }, (_, i) => i + 1),
    [cursor],
  );

  const cellWidth = (windowWidth - BOARD_PADDING * 2) / GRID_COLUMNS - 6;
  const today = todayKey();

  const renderDay = useCallback(
    ({ item: day }: { item: number }) => {
      const dateKey = makeDateKey(cursor.year, cursor.month, day);
      const stamp = stampsByDate[dateKey];
      const state: StampCellState = stamp ? 'filled' : isFutureDate(dateKey) ? 'future' : 'empty';

      return (
        <StampCell
          day={day}
          width={cellWidth}
          state={state}
          isToday={dateKey === today}
          thumbUri={stamp ? toAbsoluteUri(stamp.thumbPath) : undefined}
          onPress={() => {
            if (stamp) {
              router.push(`/stamp/${stamp.id}`);
            } else {
              router.push({ pathname: '/create', params: { date: dateKey } });
            }
          }}
        />
      );
    },
    [cursor, stampsByDate, cellWidth, today, router],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => moveMonth(-1)} hitSlop={12} style={styles.arrowButton}>
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{Strings.board.monthTitle(cursor.year, cursor.month)}</Text>
        <Pressable onPress={() => moveMonth(1)} hitSlop={12} style={styles.arrowButton}>
          <Text style={styles.arrowText}>›</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/settings')} style={styles.settingsButton} hitSlop={8}>
          <Text style={styles.settingsText}>⚙</Text>
        </Pressable>
      </View>

      <FlatList
        data={days}
        renderItem={renderDay}
        keyExtractor={(day) => String(day)}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    minWidth: 140,
    textAlign: 'center',
  },
  arrowButton: {
    paddingHorizontal: 8,
  },
  arrowText: {
    fontSize: 28,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
  },
  settingsText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  grid: {
    paddingHorizontal: BOARD_PADDING,
    paddingBottom: 32,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
});
