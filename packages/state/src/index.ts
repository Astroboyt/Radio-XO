import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Sound } from '@make-a-sound/types';

interface SoundStore {
  sounds: Sound[];
  addSound: (sound: Sound) => void;
  setSounds: (sounds: Sound[]) => void;
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set) => ({
      sounds: [],
      addSound: (sound) => set((state) => ({ sounds: [sound, ...state.sounds] })),
      setSounds: (sounds) => set({ sounds }),
    }),
    {
      name: 'make-a-sound-storage',
      // In a real app, we'd use a more specific storage for mobile (AsyncStorage) vs web
    }
  )
);
