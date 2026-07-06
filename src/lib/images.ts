import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import {
  IMAGE_FULL_MAX,
  IMAGE_FULL_QUALITY,
  IMAGE_THUMB_MAX,
  IMAGE_THUMB_QUALITY,
  STAMP_ASPECT_RATIO,
} from '@/constants/layout';

const STAMPS_DIR = 'stamps';

function stampsDirectory(): Directory {
  const dir = new Directory(Paths.document, STAMPS_DIR);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

/** DB에는 상대경로만 저장하고, 렌더링 시점에 documentDirectory와 조합한다 */
export function toAbsoluteUri(relativePath: string): string {
  return new File(Paths.document, relativePath).uri;
}

export interface CroppedImage {
  uri: string;
  width: number;
  height: number;
}

/** 사진 가운데를 우표 비율(4:5)로 잘라낸 중간 결과를 캐시에 저장한다 */
export async function cropToStampRatio(
  uri: string,
  width: number,
  height: number,
): Promise<CroppedImage> {
  let cropWidth: number;
  let cropHeight: number;
  if (width / height > STAMP_ASPECT_RATIO) {
    cropHeight = height;
    cropWidth = Math.floor(height * STAMP_ASPECT_RATIO);
  } else {
    cropWidth = width;
    cropHeight = Math.floor(width / STAMP_ASPECT_RATIO);
  }
  const originX = Math.floor((width - cropWidth) / 2);
  const originY = Math.floor((height - cropHeight) / 2);

  const context = ImageManipulator.manipulate(uri);
  context.crop({ originX, originY, width: cropWidth, height: cropHeight });
  const image = await context.renderAsync();
  // 중간 결과는 화질 유지 — 최종 압축은 saveStampImages에서
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.95 });

  return { uri: saved.uri, width: cropWidth, height: cropHeight };
}

export interface SavedStampImages {
  imagePath: string; // 상대경로 'stamps/{id}_full.jpg'
  thumbPath: string; // 상대경로 'stamps/{id}_thumb.jpg'
}

/**
 * 크롭이 끝난 이미지를 받아 압축 원본(장변 1200px)과 썸네일(장변 300px)
 * 두 벌을 stamps/ 디렉토리에 저장한다.
 */
export async function saveStampImages(
  sourceUri: string,
  sourceWidth: number,
  sourceHeight: number,
  id: string,
): Promise<SavedStampImages> {
  const dir = stampsDirectory();
  const fullName = `${id}_full.jpg`;
  const thumbName = `${id}_thumb.jpg`;

  await resizeInto(sourceUri, sourceWidth, sourceHeight, IMAGE_FULL_MAX, IMAGE_FULL_QUALITY, dir, fullName);
  await resizeInto(sourceUri, sourceWidth, sourceHeight, IMAGE_THUMB_MAX, IMAGE_THUMB_QUALITY, dir, thumbName);

  return {
    imagePath: `${STAMPS_DIR}/${fullName}`,
    thumbPath: `${STAMPS_DIR}/${thumbName}`,
  };
}

async function resizeInto(
  sourceUri: string,
  sourceWidth: number,
  sourceHeight: number,
  maxLongEdge: number,
  quality: number,
  dir: Directory,
  fileName: string,
): Promise<void> {
  const longEdge = Math.max(sourceWidth, sourceHeight);
  const target = Math.min(maxLongEdge, longEdge);
  const resize = sourceWidth >= sourceHeight ? { width: target } : { height: target };

  const context = ImageManipulator.manipulate(sourceUri);
  context.resize(resize);
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: quality });

  const dest = new File(dir, fileName);
  if (dest.exists) {
    dest.delete();
  }
  new File(saved.uri).move(dest);
}

/** 스탬프 삭제/교체 시 이미지 파일 정리 */
export function deleteStampImages(paths: { imagePath: string; thumbPath: string }): void {
  for (const rel of [paths.imagePath, paths.thumbPath]) {
    try {
      const file = new File(Paths.document, rel);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // 파일이 이미 없어도 무시 — DB 기준으로 동작
    }
  }
}
