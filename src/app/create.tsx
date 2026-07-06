import { randomUUID } from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StampFrame } from '@/components/StampFrame';
import { Colors } from '@/constants/colors';
import { STAMP_ASPECT_RATIO } from '@/constants/layout';
import { Strings } from '@/constants/strings';
import { cropToStampRatio, saveStampImages, type CroppedImage } from '@/lib/images';
import { useStampStore } from '@/store/useStampStore';

/**
 * 스탬프 만들기 플로우:
 * 사진 소스 선택(카메라/앨범) → 4:5 중앙 크롭 → 톱니 프레임 미리보기 + 메모 → 붙이기
 */
export default function CreateStampScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { width: windowWidth } = useWindowDimensions();

  const addStamp = useStampStore((s) => s.addStamp);

  const [cropped, setCropped] = useState<CroppedImage | null>(null);
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);

  // 하루 1장 제약: 이미 채워진 날짜로 들어오면 되돌려보냄 (UI에선 진입 자체가 막혀 있음)
  useEffect(() => {
    if (date && useStampStore.getState().stampsByDate[date]) {
      router.back();
    }
  }, [date, router]);

  const pickImage = async (source: 'camera' | 'album') => {
    try {
      let result: ImagePicker.ImagePickerResult;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('카메라 권한이 필요해요', '설정에서 카메라 접근을 허용해주세요.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({ quality: 1 });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('사진 권한이 필요해요', '설정에서 사진 접근을 허용해주세요.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      }

      const asset = result.canceled ? null : result.assets?.[0];
      if (!asset) return;

      setBusy(true);
      const croppedImage = await cropToStampRatio(asset.uri, asset.width, asset.height);
      setCropped(croppedImage);
    } catch (e) {
      Alert.alert('사진을 불러오지 못했어요', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const attach = async () => {
    if (!cropped || !date || busy) return;
    setBusy(true);
    try {
      const id = randomUUID();
      const saved = await saveStampImages(cropped.uri, cropped.width, cropped.height, id);
      await addStamp({
        id,
        date,
        imagePath: saved.imagePath,
        thumbPath: saved.thumbPath,
        memo: memo.trim() || null,
      });
      router.back();
    } catch (e) {
      Alert.alert('붙이기에 실패했어요', e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  const frameWidth = Math.min(windowWidth - 80, 300);
  const frameHeight = frameWidth / STAMP_ASPECT_RATIO;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{Strings.create.title}</Text>
          <Text style={styles.subtitle}>{date}</Text>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {cropped ? (
          <View style={styles.previewArea}>
            <StampFrame width={frameWidth} height={frameHeight} imageUri={cropped.uri} />
            <TextInput
              style={styles.memoInput}
              placeholder={Strings.create.memoPlaceholder}
              placeholderTextColor={Colors.textOnStamp}
              value={memo}
              onChangeText={setMemo}
              maxLength={80}
              returnKeyType="done"
            />
            <Pressable
              onPress={attach}
              disabled={busy}
              style={({ pressed }) => [styles.attachButton, (pressed || busy) && styles.buttonDim]}
            >
              {busy ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.attachText}>{Strings.create.attach}</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setCropped(null)} disabled={busy} hitSlop={8}>
              <Text style={styles.retakeText}>{Strings.create.retake}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.pickArea}>
            {busy ? (
              <ActivityIndicator size="large" color={Colors.textSecondary} />
            ) : (
              <>
                <PickButton emoji="📷" label={Strings.create.pickFromCamera} onPress={() => pickImage('camera')} />
                <PickButton emoji="🖼️" label={Strings.create.pickFromAlbum} onPress={() => pickImage('album')} />
              </>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PickButton({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pickButton, pressed && styles.buttonDim]}>
      <Text style={styles.pickEmoji}>{emoji}</Text>
      <Text style={styles.pickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 18,
  },
  closeText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  pickArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  pickButton: {
    width: 240,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingVertical: 18,
  },
  pickEmoji: {
    fontSize: 22,
  },
  pickLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  previewArea: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    gap: 18,
  },
  memoInput: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: Colors.stampBorder,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 8,
    textAlign: 'center',
  },
  attachButton: {
    width: 220,
    alignItems: 'center',
    backgroundColor: Colors.todayHighlight,
    borderRadius: 24,
    paddingVertical: 14,
  },
  attachText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  retakeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  buttonDim: {
    opacity: 0.6,
  },
});
