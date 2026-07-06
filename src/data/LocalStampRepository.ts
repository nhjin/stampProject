import { randomUUID } from 'expo-crypto';

import { nowIso, type DateKey } from '@/lib/dates';
import { getDb } from './db';
import type { StampRepository } from './StampRepository';
import type { NewStampInput, Stamp } from './types';

interface StampRow {
  id: string;
  date: string;
  image_path: string;
  thumb_path: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function rowToStamp(row: StampRow): Stamp {
  return {
    id: row.id,
    date: row.date,
    imagePath: row.image_path,
    thumbPath: row.thumb_path,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export class LocalStampRepository implements StampRepository {
  async getByMonth(year: number, month: number): Promise<Stamp[]> {
    const db = await getDb();
    const prefix = `${year}-${String(month).padStart(2, '0')}-%`;
    const rows = await db.getAllAsync<StampRow>(
      'SELECT * FROM stamps WHERE date LIKE ? AND deleted_at IS NULL ORDER BY date',
      prefix,
    );
    return rows.map(rowToStamp);
  }

  async getByDate(date: DateKey): Promise<Stamp | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<StampRow>(
      'SELECT * FROM stamps WHERE date = ? AND deleted_at IS NULL',
      date,
    );
    return row ? rowToStamp(row) : null;
  }

  async getById(id: string): Promise<Stamp | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<StampRow>(
      'SELECT * FROM stamps WHERE id = ? AND deleted_at IS NULL',
      id,
    );
    return row ? rowToStamp(row) : null;
  }

  async create(input: NewStampInput): Promise<Stamp> {
    const db = await getDb();
    const existing = await this.getByDate(input.date);
    if (existing) {
      throw new Error(`이미 ${input.date}에 우표가 있습니다`);
    }
    // date UNIQUE 제약 때문에 같은 날짜의 soft delete 잔여 행은 비워준다.
    // v2 동기화 도입 시 tombstone을 서버에 넘긴 뒤 지우는 방식으로 바뀌어야 함.
    await db.runAsync('DELETE FROM stamps WHERE date = ? AND deleted_at IS NOT NULL', input.date);

    const now = nowIso();
    const stamp: Stamp = {
      id: input.id ?? randomUUID(),
      date: input.date,
      imagePath: input.imagePath,
      thumbPath: input.thumbPath,
      memo: input.memo ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await db.runAsync(
      `INSERT INTO stamps (id, date, image_path, thumb_path, memo, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
      stamp.id,
      stamp.date,
      stamp.imagePath,
      stamp.thumbPath,
      stamp.memo,
      stamp.createdAt,
      stamp.updatedAt,
    );
    return stamp;
  }

  async updateMemo(id: string, memo: string | null): Promise<Stamp> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE stamps SET memo = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
      memo,
      nowIso(),
      id,
    );
    const updated = await this.getById(id);
    if (!updated) throw new Error(`스탬프를 찾을 수 없습니다: ${id}`);
    return updated;
  }

  async replaceImage(id: string, imagePath: string, thumbPath: string): Promise<Stamp> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE stamps SET image_path = ?, thumb_path = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
      imagePath,
      thumbPath,
      nowIso(),
      id,
    );
    const updated = await this.getById(id);
    if (!updated) throw new Error(`스탬프를 찾을 수 없습니다: ${id}`);
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const db = await getDb();
    const now = nowIso();
    await db.runAsync(
      'UPDATE stamps SET deleted_at = ?, updated_at = ? WHERE id = ?',
      now,
      now,
      id,
    );
  }

  async countAll(): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM stamps WHERE deleted_at IS NULL',
    );
    return row?.count ?? 0;
  }
}

/** 앱 전역 리포지토리 — v2에서 SyncedStampRepository로 교체 지점 */
export const stampRepository: StampRepository = new LocalStampRepository();
