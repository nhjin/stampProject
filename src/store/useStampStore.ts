import { create } from 'zustand';

import { stampRepository } from '@/data/LocalStampRepository';
import type { NewStampInput, Stamp } from '@/data/types';
import type { DateKey } from '@/lib/dates';

interface StampStore {
  /** 로드된 스탬프 캐시 (날짜 키 기준) */
  stampsByDate: Record<DateKey, Stamp>;
  totalCount: number;

  loadMonth: (year: number, month: number) => Promise<void>;
  refreshCount: () => Promise<void>;
  addStamp: (input: NewStampInput) => Promise<Stamp>;
  updateMemo: (id: string, memo: string | null) => Promise<void>;
  replaceImage: (id: string, imagePath: string, thumbPath: string) => Promise<void>;
  removeStamp: (id: string) => Promise<void>;
}

export const useStampStore = create<StampStore>((set, get) => ({
  stampsByDate: {},
  totalCount: 0,

  loadMonth: async (year, month) => {
    const stamps = await stampRepository.getByMonth(year, month);
    set((state) => {
      const merged = { ...state.stampsByDate };
      for (const stamp of stamps) {
        merged[stamp.date] = stamp;
      }
      return { stampsByDate: merged };
    });
  },

  refreshCount: async () => {
    const totalCount = await stampRepository.countAll();
    set({ totalCount });
  },

  addStamp: async (input) => {
    const stamp = await stampRepository.create(input);
    set((state) => ({
      stampsByDate: { ...state.stampsByDate, [stamp.date]: stamp },
      totalCount: state.totalCount + 1,
    }));
    return stamp;
  },

  updateMemo: async (id, memo) => {
    const updated = await stampRepository.updateMemo(id, memo);
    set((state) => ({
      stampsByDate: { ...state.stampsByDate, [updated.date]: updated },
    }));
  },

  replaceImage: async (id, imagePath, thumbPath) => {
    const updated = await stampRepository.replaceImage(id, imagePath, thumbPath);
    set((state) => ({
      stampsByDate: { ...state.stampsByDate, [updated.date]: updated },
    }));
  },

  removeStamp: async (id) => {
    const target = Object.values(get().stampsByDate).find((s) => s.id === id);
    await stampRepository.softDelete(id);
    set((state) => {
      const next = { ...state.stampsByDate };
      if (target) {
        delete next[target.date];
      }
      return {
        stampsByDate: next,
        totalCount: Math.max(0, state.totalCount - 1),
      };
    });
  },
}));
