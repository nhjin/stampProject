import type { DateKey } from '@/lib/dates';
import type { NewStampInput, Stamp } from './types';

/**
 * 데이터 접근 추상화 계층.
 * v1: LocalStampRepository (SQLite + 로컬 파일)
 * v2: SyncedStampRepository (Supabase 동기화)로 교체 예정 — 화면/스토어는 이 인터페이스에만 의존할 것.
 */
export interface StampRepository {
  /** month: 1~12. 삭제되지 않은 해당 월의 스탬프 */
  getByMonth(year: number, month: number): Promise<Stamp[]>;
  getByDate(date: DateKey): Promise<Stamp | null>;
  getById(id: string): Promise<Stamp | null>;
  /** 하루 1장 제약: 같은 날짜에 살아있는 스탬프가 있으면 throw */
  create(input: NewStampInput): Promise<Stamp>;
  updateMemo(id: string, memo: string | null): Promise<Stamp>;
  replaceImage(id: string, imagePath: string, thumbPath: string): Promise<Stamp>;
  softDelete(id: string): Promise<void>;
  countAll(): Promise<number>;
}
