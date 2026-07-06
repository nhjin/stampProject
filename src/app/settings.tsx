import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Strings } from '@/constants/strings';
import { useStampStore } from '@/store/useStampStore';

/**
 * 설정 화면 — 리마인더 on/off + 시간 선택은 M4에서 구현.
 * "백업" 메뉴는 v2(클라우드 동기화) 대비 placeholder.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const totalCount = useStampStore((s) => s.totalCount);
  const refreshCount = useStampStore((s) => s.refreshCount);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Text style={styles.backText}>‹ 보드로</Text>
      </Pressable>

      <Text style={styles.title}>{Strings.settings.title}</Text>

      <View style={styles.section}>
        <Row label={Strings.settings.reminder} value="M4에서 구현" />
        <Row label={Strings.settings.totalStamps} value={`${totalCount}개`} />
        <Row label={Strings.settings.backupPlaceholder} value="v2" />
        <Row label={Strings.settings.appVersion} value="1.0.0" />
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  section: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.stampBorder,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  rowValue: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
