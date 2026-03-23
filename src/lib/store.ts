import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    currentUser: string | null;
    setCurrentUser: (name: string | null) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            currentUser: null,
            setCurrentUser: (name) => set({ currentUser: name }),
        }),
        {
            name: 'studioplus-profile',
        }
    )
);
