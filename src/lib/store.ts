import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { USERS_DATA } from './constants';

export interface UserItem {
    name: string;
    color: string;
}

interface AppState {
    currentUser: string | null;
    setCurrentUser: (name: string | null) => void;
    users: UserItem[];
    setUsers: (users: UserItem[]) => void;
    addUser: (user: UserItem) => void;
    removeUser: (name: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            currentUser: null,
            setCurrentUser: (name) => set({ currentUser: name }),
            users: USERS_DATA,
            setUsers: (users) => set({ users: [...users].sort((a, b) => a.name.localeCompare(b.name)) }),
            addUser: (newUser) =>
                set((state) => {
                    if (state.users.some((u) => u.name.toLowerCase() === newUser.name.toLowerCase())) {
                        return state;
                    }
                    const updated = [...state.users, newUser].sort((a, b) => a.name.localeCompare(b.name));
                    return { users: updated };
                }),
            removeUser: (nameToRemove) =>
                set((state) => {
                    const updated = state.users.filter((u) => u.name.toLowerCase() !== nameToRemove.toLowerCase());
                    return {
                        users: updated,
                        currentUser: state.currentUser?.toLowerCase() === nameToRemove.toLowerCase() ? null : state.currentUser
                    };
                }),
        }),
        {
            name: 'studioplus-profile',
        }
    )
);

