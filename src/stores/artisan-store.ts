import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { INITIAL_ARTISAN_PROGRESS } from '@/data/initial-progress';
import type { ArtisanProgress } from '@/types/progression';

type ArtisanStore = {
  progress: ArtisanProgress;
  hasHydrated: boolean;
  setCraftFocus: (text: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

const isWebServer = Platform.OS === 'web' && typeof window === 'undefined';

const artisanStorage: StateStorage = {
  getItem: (name) => (isWebServer ? null : AsyncStorage.getItem(name)),
  setItem: (name, value) =>
    isWebServer ? undefined : AsyncStorage.setItem(name, value),
  removeItem: (name) =>
    isWebServer ? undefined : AsyncStorage.removeItem(name),
};

export const useArtisanStore = create<ArtisanStore>()(
  persist(
    (set) => ({
      progress: INITIAL_ARTISAN_PROGRESS,
      hasHydrated: false,
      setCraftFocus: (text) => {
        const craftFocus = text.trim().slice(0, 80);
        set((state) => ({
          progress: {
            ...state.progress,
            craftFocus: craftFocus || undefined,
          },
        }));
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'artisan-progress-v1',
      storage: createJSONStorage(() => artisanStorage),
      partialize: (state) => ({ progress: state.progress }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to restore artisan progress from local storage.', error);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
