import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StampFrame } from '@/components/StampFrame';
import { Colors } from '@/constants/colors';
import { STAMP_ASPECT_RATIO } from '@/constants/layout';

export type StampCellState = 'empty' | 'filled' | 'future';

interface StampCellProps {
  day: number;
  /** 셀 너비(px). 높이는 우표 비율 4:5로 계산 */
  width: number;
  state: StampCellState;
  isToday: boolean;
  thumbUri?: string;
  onPress?: () => void;
}

export function StampCell({ day, width, state, isToday, thumbUri, onPress }: StampCellProps) {
  const height = width / STAMP_ASPECT_RATIO;
  const disabled = state === 'future';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.cell,
        isToday && styles.todayOutline,
        pressed && styles.pressed,
      ]}
      accessibilityLabel={`${day}일 우표 칸`}
    >
      <StampFrame
        width={width}
        height={height}
        imageUri={state === 'filled' ? thumbUri : undefined}
        fillColor={state === 'future' ? Colors.stampEmptyFuture : Colors.stampEmpty}
      />
      {state === 'filled' ? (
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeText}>{day}</Text>
        </View>
      ) : (
        <View style={styles.dayOverlay} pointerEvents="none">
          <Text style={[styles.dayText, state === 'future' && styles.dayTextFuture]}>{day}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    padding: 3,
  },
  todayOutline: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.todayHighlight,
    borderRadius: 6,
    padding: 1,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  dayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnStamp,
  },
  dayTextFuture: {
    color: '#CBD8E0',
  },
  dayBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  dayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
