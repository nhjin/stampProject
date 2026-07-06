import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StampFrame } from '@/components/StampFrame';
import { Colors } from '@/constants/colors';
import { STAMP_ASPECT_RATIO } from '@/constants/layout';
import { stampRepository } from '@/data/LocalStampRepository';
import type { Stamp } from '@/data/types';
import { toAbsoluteUri } from '@/lib/images';

/**
 * 스탬프 상세 뷰 — 메모 수정 / 사진 교체 / 삭제는 M3에서 구현.
 */
export default function StampDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: windowWidth } = useWindowDimensions();
  const [stamp, setStamp] = useState<Stamp | null>(null);

  useEffect(() => {
    if (id) {
      stampRepository.getById(id).then(setStamp);
    }
  }, [id]);

  const frameWidth = windowWidth - 64;
  const frameHeight = frameWidth / STAMP_ASPECT_RATIO;

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Text style={styles.backText}>‹ 보드로</Text>
      </Pressable>

      {stamp ? (
        <View style={styles.content}>
          <StampFrame
            width={frameWidth}
            height={frameHeight}
            imageUri={toAbsoluteUri(stamp.imagePath)}
          />
          <Text style={styles.date}>{stamp.date}</Text>
          {stamp.memo ? <Text style={styles.memo}>{stamp.memo}</Text> : null}
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.memo}>불러오는 중…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  date: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  memo: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
