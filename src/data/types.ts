import type { DateKey } from '@/lib/dates';

/**
 * 스탬프 도메인 모델.
 * v2 서버 동기화 대비: uuid id, ISO 8601 타임스탬프, soft delete.
 * imagePath/thumbPath는 documentDirectory 기준 상대경로만 저장한다
 * (iOS는 앱 업데이트 시 컨테이너 절대경로가 바뀜).
 */
export interface Stamp {
  id: string;
  date: DateKey; // 'YYYY-MM-DD', 하루 1장
  imagePath: string; // 예: 'stamps/{uuid}_full.jpg'
  thumbPath: string; // 예: 'stamps/{uuid}_thumb.jpg'
  memo: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  deletedAt: string | null;
}

export interface NewStampInput {
  /** 미리 생성한 uuid — 이미지 파일명과 스탬프 id를 맞추는 용도. 없으면 자동 생성 */
  id?: string;
  date: DateKey;
  imagePath: string;
  thumbPath: string;
  memo?: string | null;
}
